export enum RiskProfile {
  CONSERVATIVE = "conservative",
  BALANCED = "balanced",
  AGGRESSIVE = "aggressive",
}

export interface IVaultAgent {
  _id?: string;
  name: string;
  description: string;
  vaultAddress: string; // unique, checksum/lowercase handled in logic
  creatorAddress: string;
  underlyingToken: string; // USDC/USDT address
  chainId: number;
  riskProfile: RiskProfile;
  systemPrompt: string;
  strategyDescription: string;
  tradingEnabled: boolean;
  maxPositionSizeBps: number;
  maxDailyTradeBps: number;
  rebalanceCooldownSeconds: number;
  lastAgentActionAt?: Date;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
