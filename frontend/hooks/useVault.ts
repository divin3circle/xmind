import { getContract, prepareContractCall, readContract } from "thirdweb";
import { useReadContract, useSendTransaction, useActiveAccount } from "thirdweb/react";
import { client } from "@/lib/client";
import { defineChain } from "thirdweb/chains";
import { AgentVaultABI } from "@/abi/AgentVault";

const fujiChain = defineChain(43113);

export function useVault(vaultAddress: string, underlyingAsset: string) {
  const activeAccount = useActiveAccount();
  const { mutateAsync: sendTx, isPending: isSendingTx } = useSendTransaction();

  // The AgentVault smart contract
  const vaultContract = getContract({
    client,
    chain: fujiChain,
    address: vaultAddress,
    abi: AgentVaultABI,
  });

  // The base asset token contract (e.g. USDC, WAVAX)
  const assetContract = getContract({
    client,
    chain: fujiChain,
    address: underlyingAsset,
  });

  // 1. Read NAV (Total Assets deployed + idle)
  const { data: totalAssets, isLoading: isLoadingNav } = useReadContract({
    contract: vaultContract,
    method: "totalAssets",
    params: [],
  });

  // 2. Read User Wallet Balance (Base Asset)
  const { data: userBalance, isLoading: isLoadingBalance } = useReadContract({
    contract: assetContract,
    method: "function balanceOf(address account) view returns (uint256)",
    params: [activeAccount?.address || "0x0000000000000000000000000000000000000000"]
  });

  // 3. Read User LP Shares (Vault Token)
  const { data: userVaultShares, isLoading: isLoadingShares } = useReadContract({
    contract: vaultContract,
    method: "balanceOf",
    params: [activeAccount?.address || "0x0000000000000000000000000000000000000000"]
  });

  // 4. Read Decimals
  const { data: tokenDecimals } = useReadContract({
    contract: assetContract,
    method: "function decimals() view returns (uint8)",
    params: []
  });

  const deposit = async (amount: string) => {
    if (!activeAccount) throw new Error("Wallet not connected");
    
    const dec = await readContract({
      contract: assetContract,
      method: "function decimals() view returns (uint8)",
      params: []
    });
    
    const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 10 ** dec));

    const currentAllowance = await readContract({
      contract: assetContract,
      method: "function allowance(address owner, address spender) view returns (uint256)",
      params: [activeAccount.address, vaultAddress]
    });

    if (currentAllowance < amountBigInt) {
      const approveTx = prepareContractCall({
        contract: assetContract,
        method: "function approve(address spender, uint256 value) returns (bool)",
        params: [vaultAddress, amountBigInt],
      });
      await sendTx(approveTx);
    }

    // AgentVault inherited ERC4626: deposit(uint256 assets, address receiver)
    const depositTx = prepareContractCall({
      contract: vaultContract,
      method: "deposit",
      params: [amountBigInt, activeAccount.address],
    });
    
    return await sendTx(depositTx);
  };

  const withdraw = async (shares: string) => {
    if (!activeAccount) throw new Error("Wallet not connected");
    
    const dec = await readContract({
      contract: assetContract,
      method: "function decimals() view returns (uint8)",
      params: []
    });
    
    const sharesBigInt = BigInt(Math.floor(parseFloat(shares) * 10 ** dec));

    // AgentVault inherited ERC4626: redeem(uint256 shares, address receiver, address owner)
    const withdrawTx = prepareContractCall({
      contract: vaultContract,
      method: "redeem",
      params: [sharesBigInt, activeAccount.address, activeAccount.address],
    });
    
    return await sendTx(withdrawTx);
  };

  return {
    totalAssets,
    userBalance,
    userVaultShares,
    tokenDecimals,
    isLoadingNav,
    isLoadingBalance,
    isLoadingShares,
    isProcessing: isSendingTx,
    deposit,
    withdraw,
  };
}
