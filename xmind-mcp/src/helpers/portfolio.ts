import { ethers } from "ethers";
import { AVAX_FUJI_RPC } from "./avalanche";

/**
 * Get Vault state (NAV, Cash, Positions, Utilization)
 */
export async function getVaultState(
  vaultAddress: string,
  rpcUrl: string = AVAX_FUJI_RPC
) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  // ABI for state variables and totalAssets
  const abi = [
    "function totalAssets() view returns (uint256)",
    "function asset() view returns (address)",
    "function totalHighRiskAllocation() view returns (uint256)",
    "function totalStableAllocation() view returns (uint256)",
    "function riskProfile() view returns (uint8)",
    "function name() view returns (string)"
  ];
  
  const contract = new ethers.Contract(vaultAddress, abi, provider);
  
  const [nav, underlying, highRisk, stable, profile, name] = await Promise.all([
    contract.totalAssets().catch(() => 0n),
    contract.asset().catch(() => "0xF130b00B32EFE015FC080f7Dd210B0E937e627c2"),
    contract.totalHighRiskAllocation().catch(() => 0n),
    contract.totalStableAllocation().catch(() => 0n),
    contract.riskProfile().catch(() => 1),
    contract.name().catch(() => "AI Vault")
  ]);
  
  // Get idle underlying balance
  const underlyingAbi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)", "function symbol() view returns (string)"];
  const underlyingContract = new ethers.Contract(underlying, underlyingAbi, provider);
  
  const [idleBalance, decimals, symbol] = await Promise.all([
    underlyingContract.balanceOf(vaultAddress).catch(() => 0n),
    underlyingContract.decimals().catch(() => 6),
    underlyingContract.symbol().catch(() => "USDC")
  ]);

  const navFormatted = Number(ethers.formatUnits(nav, decimals));
  const idleFormatted = Number(ethers.formatUnits(idleBalance, decimals));
  const investedFormatted = navFormatted - idleFormatted;

  return {
    vaultName: name,
    total_value_usd: navFormatted, // For USDC vaults, 1:1
    cash_position_usd: idleFormatted,
    invested_value_usd: investedFormatted,
    utilization_ratio: navFormatted > 0 ? (investedFormatted / navFormatted) * 100 : 0,
    positions: [
      { asset: symbol, location: "idle", value: idleFormatted, type: "cash" },
      { asset: "AVAX/ETH", location: "active", value: investedFormatted, type: "invested" }
    ],
    risk_mode: profile === 0 ? "conservative" : profile === 1 ? "balanced" : "aggressive",
    available_liquidity_usd: idleFormatted,
    underlyingAsset: underlying,
    decimals
  };
}

/**
 * Get Vault performance metrics (PnL, Drawdown estimates)
 */
export async function getVaultPerformance(vaultAddress: string) {
  // Mock performance data for now as we don't have historical subgraphs yet
  return {
    daily_pnl_percent: (Math.random() * 2 - 1).toFixed(2),
    weekly_pnl_percent: (Math.random() * 5).toFixed(2),
    drawdown_percent: (Math.random() * 3).toFixed(2),
    sharpe_ratio: 1.85,
    volatility_index: "low",
    inception_date: "2024-02-20"
  };
}
