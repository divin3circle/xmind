import { mockAgents } from "@/components/agents";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAgentById(id: string) {
  return mockAgents.find((agent) => agent._id === id);
}

const samples: Record<string, string[]> = {
  "1": [
    "Summarize the risks and approvals in this swap transaction before execution.",
    "Simulate this transaction in a sandbox and flag any potential slippage or allowance issues.",
    "Generate a plain-English explanation of what this contract call will do on-chain.",
  ],
  "2": [
    "Find the top 3 yield farms this week with APY, TVL, and risk notes.",
    "Compare two pools and tell me which has better short-term risk-adjusted yield.",
    "Scan new farms and return that which APY changed by more than 10% today.",
  ],
  "3": [
    "Create an ERC-4337 UserOperation to approve, swap, and stake 200 USDC.e in one bundle.",
    "Draft a UserOperation that unstakes and swaps rewards to USDC.e, minimizing gas.",
    "Validate this UserOperation for gas limits and suggest optimizations before signing.",
  ],
  "4": [
    "Find the cheapest cross-chain route from Ethereum to Avalanche for 5000 USDC.e with low slippage.",
    "Compare official bridge vs third-party bridges and CEX off-ramps for moving 1 ETH to Base.",
    "Propose a liquidity route that minimizes gas while avoiding high slippage pools right now.",
  ],
};

export function getAgentSamples(agentId: string): string[] {
  return samples[agentId] || [];
}
