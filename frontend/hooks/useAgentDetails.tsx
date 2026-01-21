import { Agent } from "@/lib/utils";
import React from "react";

export interface AgentDetails {
  _id: string;
  name: string;
  description: string;
  image: string;
  contractAddress: string;
  creatorAddress?: string;
  tasksCompleted?: number;
  tasksRan?: number;
  totalEarned?: number;
  ratings?: number[];
  createdAt?: string;
}

interface UseAgentDetailsResult {
  agent: Agent | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAgentDetails(
  agentId: string | undefined,
): UseAgentDetailsResult {
  const [agent, setAgent] = React.useState<Agent | null>(null);
  const [loading, setLoading] = React.useState<boolean>(!!agentId);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAgent = React.useCallback(async () => {
    if (!agentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/agent/details?agentId=${agentId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch agent");
      }
      const data = await res.json();
      console.log("Fetched agent details:", data);
      setAgent(data.agent || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch agent");
      setAgent(null);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  React.useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  return { agent, loading, error, refetch: fetchAgent };
}
