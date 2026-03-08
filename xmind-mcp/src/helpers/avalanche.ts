import { ethers } from "ethers";

export const AVAX_FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";
export const AVAX_FUJI_CHAIN_ID = 43113;

// Action Enum from AgentVault.sol
export enum Action {
  SWAP = 0,
  BRIDGE = 1,
  POOL = 2
}

/**
 * Signs a trade instruction for CREIntegration.submitAIInstruction
 */
export async function signTradeInstruction({
  vault,
  asset,
  amount,
  minAmountOut,
  action,
  isHighRisk,
  nonce,
  data,
  privateKey
}: {
  vault: string;
  asset: string;
  amount: string; // in wei (as string)
  minAmountOut: string; // in units (as string)
  action: Action;
  isHighRisk: boolean;
  nonce: number;
  data: string; // hex string
  privateKey: string;
}): Promise<string> {
  const wallet = new ethers.Wallet(privateKey);
  
  // Create message hash matching CREIntegration.sol:
  // keccak256(abi.encodePacked(vault, asset, amount, minAmountOut, action, isHighRisk, nonce, data))
  
  // Note: abi.encodePacked equivalent in ethers
  const messageHash = ethers.solidityPackedKeccak256(
    ["address", "address", "uint256", "uint256", "uint8", "bool", "uint256", "bytes"],
    [vault, asset, amount, minAmountOut, action, isHighRisk, nonce, data]
  );

  // Sign the message (prefixing with "\x19Ethereum Signed Message:\n32" is handled by signMessage)
  // Actually recover in CREIntegration uses toEthSignedMessageHash()
  // ethers.wallet.signMessage does exactly this.
  const signature = await wallet.signMessage(ethers.getBytes(messageHash));
  
  return signature;
}

/**
 * Generic ERC20 Balance checker for Avalanche
 */
export async function getAvalancheERC20Balance(
  tokenAddress: string,
  walletAddress: string,
  rpcUrl: string = AVAX_FUJI_RPC
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const abi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
  const contract = new ethers.Contract(tokenAddress, abi, provider);
  
  const [balance, decimals] = await Promise.all([
    contract.balanceOf(walletAddress),
    contract.decimals()
  ]);
  
  return ethers.formatUnits(balance, decimals);
}

/**
 * Get Vault state (NAV and Idle liquidity)
 */
export async function getVaultState(
  vaultAddress: string,
  rpcUrl: string = AVAX_FUJI_RPC
) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  // Partial ABI for state variables and totalAssets
  const abi = [
    "function totalAssets() view returns (uint256)",
    "function asset() view returns (address)",
    "function totalHighRiskAllocation() view returns (uint256)",
    "function totalStableAllocation() view returns (uint256)",
    "function riskProfile() view returns (uint8)"
  ];
  
  const contract = new ethers.Contract(vaultAddress, abi, provider);
  
  const [nav, underlying, highRisk, stable, profile] = await Promise.all([
    contract.totalAssets(),
    contract.asset(),
    contract.totalHighRiskAllocation(),
    contract.totalStableAllocation(),
    contract.riskProfile()
  ]);
  
  // Get idle underslying balance
  const underlyingAbi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
  const underlyingContract = new ethers.Contract(underlying, underlyingAbi, provider);
  
  const [idleBalance, decimals] = await Promise.all([
    underlyingContract.balanceOf(vaultAddress),
    underlyingContract.decimals()
  ]);

  return {
    nav: ethers.formatUnits(nav, decimals),
    idle: ethers.formatUnits(idleBalance, decimals),
    highRisk: ethers.formatUnits(highRisk, decimals),
    stable: ethers.formatUnits(stable, decimals),
    riskProfile: profile, // 0: Conservative, 1: Balanced, 2: Aggressive
    underlyingAsset: underlying
  };
}
