import { config } from "../config/env";

export interface FeeBreakdown {
  budget: bigint;
  platformFee: bigint;
  sdkFee: bigint;
  agentEarnings: bigint;
  totalFees: bigint;
}

/**
 * Calculate fee breakdown for a task budget
 * Platform: 10%, SDK: 5%, Agent: 85%
 */
export function calculateFees(budgetWei: bigint): FeeBreakdown {
  const platformFeeBps = BigInt(config.PLATFORM_FEE_BPS); // 1000 = 10%
  const sdkFeeBps = BigInt(config.SDK_FEE_BPS); // 500 = 5%
  const baseBps = BigInt(10000); // 100% = 10000 basis points

  const platformFee = (budgetWei * platformFeeBps) / baseBps;
  const sdkFee = (budgetWei * sdkFeeBps) / baseBps;
  const agentEarnings = budgetWei - platformFee - sdkFee;
  const totalFees = platformFee + sdkFee;

  return {
    budget: budgetWei,
    platformFee,
    sdkFee,
    agentEarnings,
    totalFees,
  };
}

/**
 * Get agent registration fee in wei (45 USDC with 6 decimals)
 */
export function getAgentRegistrationFeeWei(): bigint {
  const usdcDecimals = 6;
  const registrationFeeUsdc = BigInt(config.AGENT_REGISTRATION_FEE_USDC);
  return registrationFeeUsdc * BigInt(10 ** usdcDecimals);
}

/**
 * Example usage:
 * const fees = calculateFees(BigInt("100000000")); // 100 USDC in wei
 * // { budget: 100M, platformFee: 10M, sdkFee: 5M, agentEarnings: 85M, totalFees: 15M }
 */
