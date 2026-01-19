import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ITemplate } from "./models/Template";

export interface Agent {
  _id?: string;
  agentName: string;
  image: string;
  creatorAddress: string;
  tagline?: string;
  description: string;
  tasksCompleted: number;
  totalEarned: string;
  ratings: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const mockAgents: Agent[] = [];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTemplateById(
  id: string,
  templates: ITemplate[],
): ITemplate | undefined {
  return templates.find((template) => template._id === id);
}

const samples: Record<string, string[]> = {
  "696dc9bbc94a78a12a77893f": [
    "Find the top 3 yield farms this week with APY, TVL, and risk notes.",
    "Compare two pools and tell me which has better short-term risk-adjusted yield.",
    "Scan new farms and return that which APY changed by more than 10% today.",
  ],
  "696dc9bbc94a78a12a778941": [
    "What is the balance of this address on Cronos?",
    "Can you retriev information about this transaction hash?",
    "What's the cronos id of this wallet address?",
  ],
  "696dc9bbc94a78a12a778940": [
    "Find the cheapest cross-chain route from Ethereum to Avalanche for 5000 USDC.e with low slippage.",
    "Compare official bridge vs third-party bridges and CEX off-ramps for moving 1 ETH to Base.",
    "Propose a liquidity route that minimizes gas while avoiding high slippage pools right now.",
  ],
};

export function getTemplateSamples(templateId: string): string[] {
  return samples[templateId] || [];
}
