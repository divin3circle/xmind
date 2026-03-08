import { useState } from "react";
import { getContract, prepareContractCall, waitForReceipt } from "thirdweb";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { client } from "@/lib/client";
import { defineChain } from "thirdweb/chains";
import config from "@/config/env";
import { VaultFactoryABI } from "@/abi/VaultFactory";

const fujiChain = defineChain(43113);

interface DeployAgentParams {
  name: string;
  description: string;
  image: string;
  systemPrompt: string;
  underlyingToken: string;
  riskProfile: string;
  agentWalletAddress: string;
  onSuccess?: (transactionHash: string, contractAddress: string) => void;
  onError?: (error: string) => void;
}

const mapRiskProfileToUint = (riskStr: string) => {
  if (riskStr === "conservative") return 0;
  if (riskStr === "balanced") return 1;
  if (riskStr === "aggressive") return 2;
  return 1;
};

export const useDeployContract = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deployedAgentAddress, setDeployedAgentAddress] = useState<string | null>(null);

  const { mutateAsync: sendTx } = useSendTransaction();
  const activeAccount = useActiveAccount();

  const deployAgent = async (params: DeployAgentParams) => {
    try {
      if (!activeAccount) throw new Error("Wallet not connected");

      setIsDeploying(true);
      setError(null);
      
      const factoryAddress = config.NEXT_PUBLIC_VAULT_FACTORY_ADDRESS;
      if (!factoryAddress) {
        throw new Error("Vault Factory address not configured in .env (NEXT_PUBLIC_VAULT_FACTORY_ADDRESS). Please deploy the factory first.");
      }

      const factoryContract = getContract({
        client,
        chain: fujiChain,
        address: factoryAddress,
        abi: VaultFactoryABI,
      });

      console.log("Preparing deployment transaction...");
      const tx = prepareContractCall({
        contract: factoryContract,
        method: "deployVault",
        params: [
          params.underlyingToken,
          params.name,
          params.name, // simply using the name as the symbol token
          mapRiskProfileToUint(params.riskProfile)
        ]
      });

      console.log("Sending transaction...");
      const receiptData = await sendTx(tx);
      
      console.log("Waiting for receipt...", receiptData.transactionHash);
      const receipt = await waitForReceipt({
        client,
        chain: fujiChain,
        transactionHash: receiptData.transactionHash,
      });

      // Extract the AgentVault address from the VaultCreated event logs
      // VaultCreated(address indexed vault, address indexed owner, address asset)
      // keccak256("VaultCreated(address,address,address)")
      const VAULT_CREATED_TOPIC = "0x897c133dfbfe1f6239e98b4ffd7e4f6c86a62350a131a7a37790419f58af02f9";
      
      let vaultAddress = "";
      for (const log of receipt.logs) {
        if (log.topics && log.topics[0]?.toLowerCase() === VAULT_CREATED_TOPIC) {
          // topics[1] = indexed vault address (left-padded to 32 bytes)
          vaultAddress = "0x" + log.topics[1]?.slice(-40);
          break;
        }
      }

      if (!vaultAddress) {
        console.warn("Could not cleanly parse vault address from logs, falling back to transaction hash");
        vaultAddress = receiptData.transactionHash; 
      }

      console.log("Deployed Vault address:", vaultAddress);
      setDeployedAgentAddress(vaultAddress);
      setIsDeploying(false);
      params.onSuccess?.(receiptData.transactionHash, vaultAddress);

    } catch (err: any) {
      console.error("Error deploying vault:", err);
      const errorMessage = err.message || "Failed to deploy Vault via Factory";
      setError(errorMessage);
      setIsDeploying(false);
      params.onError?.(errorMessage);
    }
  };

  return {
    deployAgent,
    isDeploying,
    error,
    deployedAgentAddress,
  };
};

export type { DeployAgentParams };
