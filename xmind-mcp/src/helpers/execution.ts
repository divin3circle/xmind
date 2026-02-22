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

// Deployed mock tokens on Avalanche Fuji
const FUJI_TOKENS: Record<string, string> = {
  "AVAX":  "0xDcc1704257b818271359f117F349f16499bF128E", // mWAVAX
  "ETH":   "0x5bC55a2641b20e0E2DCc977548aA672c3A7F03EC", // mWETH
  "BTC":   "0xc92bef678CCF43251cB8f1d321B995D192784453", // mWBTC
  "WBTC":  "0xc92bef678CCF43251cB8f1d321B995D192784453", // mWBTC alias
  "WETH":  "0x5bC55a2641b20e0E2DCc977548aA672c3A7F03EC", // mWETH alias
  "WAVAX": "0xDcc1704257b818271359f117F349f16499bF128E", // mWAVAX alias
  "LINK":  "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
  "USDC":  "0xF130b00B32EFE015FC080f7Dd210B0E937e627c2",
};

/**
 * THE CORE INSTRUCTION BUILDER
 * Translates strategist's intent (Target Allocation) into concrete signed codes.
 */
export async function compileVaultInstruction({
  vaultAddress,
  targetAllocation,
  privateKey
}: {
  vaultAddress: string;
  targetAllocation: Record<string, number>;
  privateKey: string;
}) {
  const state = await getVaultState(vaultAddress);
  const decimals = Number(state.decimals); // BigInt → Number

  // Process the first asset in the allocation
  const rawKey = Object.keys(targetAllocation)[0] || "AVAX";
  const assetSymbol = rawKey.toUpperCase();
  const targetWeight = targetAllocation[rawKey] ?? 0.1;

  const currentInvestedWeight = state.total_value_usd > 0
    ? state.invested_value_usd / state.total_value_usd
    : 0;
  const deltaWeight = targetWeight - currentInvestedWeight;

  if (deltaWeight <= 0) {
    return { status: "no_action_needed", reason: "Current allocation meets or exceeds target" };
  }

  const amountToSwap = state.total_value_usd * deltaWeight;
  const amountInWei = ethers.parseUnits(amountToSwap.toFixed(decimals), decimals).toString();
  const minAmountOut = Math.max(1, Math.floor(amountToSwap * 0.985)).toString();

  const isHighRisk = deltaWeight > 0.2;
  const nonce = Date.now();
  const mockData = ethers.hexlify(ethers.randomBytes(32));

  // Resolve target asset address from our deployed mocks
  const targetAssetAddress = FUJI_TOKENS[assetSymbol] || FUJI_TOKENS["AVAX"];

  const signature = await signTradeInstruction({
    vault: vaultAddress,
    asset: targetAssetAddress,
    amount: amountInWei,
    minAmountOut,
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
      assetSymbol,
      amount: amountInWei,
      minAmountOut,
      action: "SWAP",
      actionId: 0,
      isHighRisk,
      nonce,
      data: mockData,
      signature
    },
    summary: `Rebalancing ${state.vaultName}: Swapping ${amountToSwap.toFixed(2)} mUSDC → ${assetSymbol}`
  };
}
