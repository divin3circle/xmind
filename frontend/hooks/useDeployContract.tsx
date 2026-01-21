import { cronosTestnet } from "@/app/ThirdwebProvider";
import config from "@/config/env";
import { client } from "@/lib/client";
import {
  prepareContractCall,
  getContract,
  toWei,
  waitForReceipt,
} from "thirdweb";
import { useSendTransaction } from "thirdweb/react";
import { useState } from "react";

interface DeployAgentParams {
  name: string;
  description: string;
  image: string;
  systemPrompt: string;
  agentWalletAddress: string;
  onSuccess?: (transactionHash: string, contractAddress: string) => void;
  onError?: (error: string) => void;
}

export const useDeployContract = () => {
  const {
    mutate: sendTx,
    data: transactionResult,
    isPending,
  } = useSendTransaction();
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deployedAgentAddress, setDeployedAgentAddress] = useState<
    string | null
  >(null);

  const deployAgent = async (params: DeployAgentParams) => {
    try {
      setIsDeploying(true);
      setError(null);
      const contract = getContract({
        address: config.NEXT_PUBLIC_AGENT_FACTORY_ADDRESS,
        chain: cronosTestnet,
        client,
      });

      // Prepare the transaction
      const transaction = prepareContractCall({
        contract,
        method:
          "function deployAgent(string _name, string _description, string _image, string _systemPrompt, address _agentWalletAddress) payable returns (address)",
        params: [
          params.name,
          params.description,
          params.image,
          params.systemPrompt,
          params.agentWalletAddress,
        ],
        value: toWei(
          config.NEXT_PUBLIC_AGENT_FACTORY_DEPLOYMENT_FEE_CRO.toString(),
        ),
      });

      // Send the transaction
      sendTx(transaction, {
        onSuccess: async (result) => {
          console.log("Agent deployed successfully:", result);
          try {
            // Wait for transaction receipt to get the deployed contract address
            const receipt = await waitForReceipt({
              client,
              chain: cronosTestnet,
              transactionHash: result.transactionHash,
            });

            console.log("Transaction receipt:", receipt);

            // Extract the deployed contract address from logs
            // The factory should emit an event with the deployed address
            // Typically it's in the first log or you can parse specific events
            let deployedAddress = "";

            if (receipt.logs && receipt.logs.length > 0) {
              // The deployed contract address is typically in the first log's address field
              // or you might need to decode the event data depending on your factory implementation
              const agentDeployedLog = receipt.logs.find(
                (log) => log.topics.length > 0, // Find the AgentDeployed event
              );

              if (agentDeployedLog) {
                // If the address is emitted in the event, it would be in topics or data
                // For now, we'll check the contractAddress from the first log
                deployedAddress = receipt.logs[0].address || "";
              }
            }

            console.log("Deployed contract address:", deployedAddress);
            setDeployedAgentAddress(deployedAddress);
            setIsDeploying(false);
            params.onSuccess?.(result.transactionHash, deployedAddress);
          } catch (err) {
            console.error("Error getting receipt:", err);
            // Still call success with transaction hash even if we couldn't get the address
            setIsDeploying(false);
            params.onSuccess?.(result.transactionHash, "");
          }
        },
        onError: (err) => {
          console.error("Deployment failed:", err);
          const errorMessage = err.message || "Deployment failed";
          setError(errorMessage);
          setIsDeploying(false);
          params.onError?.(errorMessage);
        },
      });
    } catch (err) {
      console.error("Error preparing deployment:", err);
      const errorMessage = "Failed to prepare deployment";
      setError(errorMessage);
      setIsDeploying(false);
      params.onError?.(errorMessage);
    }
  };

  return {
    deployAgent,
    isDeploying: isDeploying || isPending,
    error,
    transactionResult,
    deployedAgentAddress,
  };
};

export type { DeployAgentParams };
