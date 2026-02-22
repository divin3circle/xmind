import { useState, useEffect } from "react";
import { ITemplate } from "@/lib/models/Template";

export const useTemplates = () => {
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Providing predefined Vault Strategies as Templates
    setTemplates([
      {
        _id: "strategy-1",
        templateName: "Blue-Chip Yield Optimizer",
        description: "Conservatively farms yield on major Avalanche stablecoin and wrapped pairs via lending protocols.",
        image: "/feature2.avif",
        creatorAddress: "0x0000000000000000000000000000000000000000",
        tagline: "Low Risk Aave Yields",
        systemPrompt: "You are a conservative AI Portfolio Manager running on Avalanche. Your primary goal is to preserve capital and farm yield via Aave V3. Do not engage in high-risk SWAP actions unless directed. Analyze the portfolio risk constantly.",
        totalEarned: "4200000000000",
        ratings: [4, 5, 5, 5],
        usedBy: 1042
      },
      {
        _id: "strategy-2",
        templateName: "Aggressive Momentum Multi-Asset",
        description: "Algorithmically trades AVAX, LINK, and ETH exploiting short term volatility on TraderJoe.",
        image: "/feature3.jpg",
        creatorAddress: "0x0000000000000000000000000000000000000000",
        tagline: "High Alpha DEX Swaps",
        systemPrompt: "You are an aggressive algorithmic trader on Avalanche. Your mandate is to maximize Alpha through constant portfolio rebalancing utilizing TraderJoe. You may execute high slippage tolerance trades if momentum is exceptionally strong.",
        totalEarned: "8900000000000",
        ratings: [5, 4, 3, 4],
        usedBy: 430
      }
    ]);
  }, []);

  return { templates, loading, error };
};
