import { ethers } from "ethers";
import { getVaultState } from "./portfolio";
import { Action, signTradeInstruction } from "./avalanche";

/**
 * Simulates a trade outcome at the portfolio level
 */
export async function simulateTrade({
  vaultAddress,
  action,
  targetAsset,
  amountUsd
}: {
  vaultAddress: string;
  action: string;
  targetAsset: string;
  amountUsd: number;
}) {
  const currentState = await getVaultState(vaultAddress);
  
  // Predict post-trade state
  const postInvested = currentState.invested_value_usd + amountUsd;
  const postCash = currentState.cash_position_usd - amountUsd;
  
  return {
    status: "success",
    expected_output: `${amountUsd} units of ${targetAsset} equivalent`,
    post_trade_allocation: {
      cash_percent: ((postCash / currentState.total_value_usd) * 100).toFixed(2),
      invested_percent: ((postInvested / currentState.total_value_usd) * 100).toFixed(2)
    },
    slippage_estimate: "0.15%",
    gas_fee_estimate_usd: "0.08"
  };
}

const FUJI_TOKENS: Record<string, string> = {
  "AVAX": "0xd00ae08403B9bbb9124bB305C09058E32C39A48c", // WAVAX on Fuji
  "USDC": "0xF130b00B32EFE015FC080f7Dd210B0E937e627c2",
  "LINK": "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
  "WSTETH": "0x3f9320845083AC5Fd0dF1Aa330fb3506157fe918" // Placeholder ETH
};

/**
 * THE CORE INSTRUCTION BUILDER
 * Translates strategist's intent (Target Allocation) into concrete signed codes.
 */
export async function compileVaultInstruction({
  vaultAddress,
  targetAllocation, // e.g., { AVAX: 0.3 }
  privateKey
}: {
  vaultAddress: string;
  targetAllocation: Record<string, number>;
  privateKey: string;
}) {
  const state = await getVaultState(vaultAddress);
  
  // Logic: Compare current vs target and determine the delta trade
  const assetSymbol = Object.keys(targetAllocation)[0]?.toUpperCase() || "AVAX";
  const targetWeight = targetAllocation[assetSymbol];
  
  const currentInvestedWeight = state.invested_value_usd / state.total_value_usd;
  const deltaWeight = targetWeight - currentInvestedWeight;
  
  if (deltaWeight <= 0) {
    return { status: "no_action_needed", reason: "Current allocation matches or exceeds target" };
  }
  
  const amountToSwap = state.total_value_usd * deltaWeight;
  // Convert USD chunk back to underlying asset wei (Assuming 1:1 for USDC base vaults)
  const amountInWei = ethers.parseUnits(amountToSwap.toFixed(state.decimals), state.decimals).toString();
  
  const isHighRisk = deltaWeight > 0.2;
  const nonce = Date.now(); // Simplified nonce
  const mockData = ethers.hexlify(ethers.randomBytes(32)); 
  
  // Resolve target asset address safely
  const targetAssetAddress = FUJI_TOKENS[assetSymbol] || FUJI_TOKENS["AVAX"];
  
  const signature = await signTradeInstruction({
    vault: vaultAddress,
    asset: targetAssetAddress,
    amount: amountInWei,
    minAmountOut: (amountToSwap * 0.985).toFixed(0), // 1.5% slippage placeholder (units logic depends on pair)
    action: Action.SWAP,
    isHighRisk,
    nonce,
    data: mockData,
    privateKey
  });

  return {
    status: "ready_for_execution",
    instruction: {
      vault: vaultAddress,
      asset: targetAssetAddress,
      amount: amountInWei,
      minAmountOut: (amountToSwap * 0.985).toFixed(0),
      action: "SWAP",
      isHighRisk,
      nonce,
      data: mockData,
      signature
    },
    summary: `Rebalancing ${state.vaultName}: Swapping ${amountToSwap.toFixed(2)} idle units for ${assetSymbol}`
  };
}
