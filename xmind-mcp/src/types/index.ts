/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

/**
 * Farm data interface
 */
export interface Farm {
  id: string;
  pid: string;
  lpSymbol: string;
  lpAddress: string;
  token: string;
  quoteToken: string;
  version: string;
  suffix: string;
  rewardStartAt: number | string;
  rewardEndAt: number | string;
  isFinished: boolean;
  isMigrated: boolean;
  isBoostEnable: boolean;
  isBoostFarmExpired: boolean;
  isAutoHarvestEnabled?: boolean;
  rewarders: unknown[];
  chain: string;
  chainId: number | string;
  baseApr: number | string;
  baseApy: number | string;
  lpApr: number | string;
  lpApy: number | string;
}

/**
 * Type for farms API response
 */
export type FarmsResponse = ApiResponse<Farm[]>;

/**
 * Generic simulation result for local fork (Anvil)
 */
export interface SimulationResult {
  success: boolean;
  gasEstimate: string | null;
  returnData?: string;
  revertReason?: string;
  assetDeltas: AssetChange[]; // best-effort decoded asset movements; may be empty when decoding is not possible
}

/**
 * Asset change from Alchemy simulation
 */
export interface AssetChange {
  assetType: "ERC20" | "ERC721" | "ERC1155" | "NATIVE";
  changeType: "TRANSFER" | "APPROVE" | "MINT" | "BURN";
  from: string;
  to: string;
  rawAmount: string;
  contractAddress: string | null;
  tokenId: string | null;
  decimals: number;
  symbol: string;
  name: string;
  logo: string;
  amount: string;
}

/**
 * Alchemy transaction simulation result
 */
export interface AlchemySimulationResult {
  changes: AssetChange[];
  gasUsed: string;
  error: string | null;
}

export interface MainnetBalances {
  usdc: string;
  cro: string;
}

/**
 * Full Alchemy simulation response
 */
export interface AlchemySimulationResponse {
  jsonrpc: "2.0";
  id: number;
  result: AlchemySimulationResult;
}
