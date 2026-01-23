import config from "@/config/env";
import { ethers } from "ethers";
import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { useMyAgents } from "./useMyAgents";

export interface EarningsData {
  totalAgentBalance: string;
  usdcBalance: string;
}

const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org/");

const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const contract = new ethers.Contract(
  config.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS,
  erc20Abi,
  provider,
);

export const useEarningsData = () => {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const activeAccount = useActiveAccount();
  const { agents } = useMyAgents();

  const fetchUsdcBalance = async () => {
    if (!activeAccount?.address) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const [balanceInWei, decimals] = await Promise.all([
        contract.balanceOf(activeAccount.address),
        contract.decimals(),
      ]);

      const balanceFormatted = ethers.formatUnits(balanceInWei, decimals);
      setEarningsData((prev) => ({
        totalAgentBalance: prev?.totalAgentBalance || "0",
        usdcBalance: balanceFormatted,
      }));
    } catch (error) {
      console.error("Error fetching earnings data:", error);
      setError("Failed to fetch earnings data" + error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentBalance = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!agents || agents.length === 0) {
        setEarningsData((prev) => ({
          totalAgentBalance: "0",
          usdcBalance: prev?.usdcBalance || "0",
        }));
        return "0";
      }

      const decimals = await contract.decimals();
      const balancesInWei = await Promise.all(
        agents.map((agent) => contract.balanceOf(agent.walletAddress)),
      );

      const totalBalance = balancesInWei.reduce((acc, balanceInWei) => {
        const balanceFormatted = ethers.formatUnits(balanceInWei, decimals);
        return acc + Number(balanceFormatted);
      }, 0);

      const formattedTotal = totalBalance.toFixed(2);

      setEarningsData((prev) => ({
        totalAgentBalance: formattedTotal,
        usdcBalance: prev?.usdcBalance || "0",
      }));

      return formattedTotal;
    } catch (error) {
      console.log("Error getting agent balances" + error);
      setError("Failed to fetch agent balances" + error);
    } finally {
      setLoading(false);
    }
  };

  return {
    earningsData,
    fetchUsdcBalance,
    fetchAgentBalance,
    loading,
    error,
    refetch: fetchUsdcBalance,
  };
};
