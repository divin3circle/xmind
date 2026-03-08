/**
 * Generic simulation result
 */
export interface SimulationResult {
  success: boolean;
  gasEstimate: string | null;
  returnData?: string;
  revertReason?: string;
  assetDeltas: AssetChange[];
}

/**
 * Asset change from simulation
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

export interface MainnetBalances {
  usdc: string;
  avax: string;
}
