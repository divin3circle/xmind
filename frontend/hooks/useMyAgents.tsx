import React, { useEffect } from "react";
import { Agent } from "@/lib/utils";
import { useActiveAccount } from "thirdweb/react-native";

export const useMyAgents = () => {
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const activeAccount = useActiveAccount();

  const fetchMyAgents = async (walletAddress: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/agent/my-agent?walletAddress=${walletAddress}`,
      );
      const data = await response.json();
      if (data.success) {
        setAgents(data.agents);
      } else {
        setError(data.error || "Failed to fetch agents");
      }
    } catch (error) {
      setError("An error occurred while fetching agents");
      console.error("Fetch my agents error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAccount?.address) {
      fetchMyAgents(activeAccount.address);
    }
  }, [activeAccount?.address]);

  return { agents, loading, error };
};
