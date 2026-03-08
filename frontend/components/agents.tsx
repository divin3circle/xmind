"use client";
import { IconPlus } from "@tabler/icons-react";
import TemplateCard from "./template-card";

function Agents() {
  const actions = [
    {
      _id: "swap",
      templateName: "SWAP",
      image: "/feature2.avif",
      creatorAddress: "0x60ae616a2155ee3d9a68541ba4544862310933d4", // Trader Joe
      description: "AI-optimized multi-asset swaps on Avalanche. Utilizing Trader Joe for deep liquidity and minimal slippage on all ERC-20 pairs.",
      totalEarned: "1250000000000",
      ratings: [5, 5, 4, 5],
      usedBy: 842,
      tagline: "DEX Aggregation"
    },
    {
      _id: "bridge",
      templateName: "BRIDGE",
      image: "/feature3.jpg",
      creatorAddress: "0x45A131C20056C9d875043F2479CF540C6276004d", // Stargate
      description: "Secure cross-chain bridging via Stargate. Move capital to Base, Arbitrum, and Optimism with on-chain verification.",
      totalEarned: "890000000000",
      ratings: [5, 4, 5, 5],
      usedBy: 621,
      tagline: "Cross-Chain Liquidity"
    },
    {
      _id: "pool",
      templateName: "POOL",
      image: "/feature2.webp",
      creatorAddress: "0x4F01...72a2", // Placeholder for Aave/Benqi
      description: "Automated lending and yield farming. Deploy idle capital into Aave and Benqi to maximize passive returns within risk limits.",
      totalEarned: "450000000000",
      ratings: [4, 5, 5, 4],
      usedBy: 433,
      tagline: "Yield Generation"
    }
  ];

  return (
    <section className="my-24">
      <div className="py-8 mx-4 border mt-8 relative border-dashed px-4 overflow-hidden">
        <IconPlus className="absolute -top-3 -right-3" color="gray" />
        <IconPlus className="absolute -top-3 -left-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -left-3" color="gray" />

        <h1 className="text-xl font-bold font-sans text-left">
          Agent Execution Suite
        </h1>
        <p className="text-muted-foreground text-xs font-sans max-w-md leading-relaxed mt-1">
          Our AI Agents utilize three core primitives to manage your portfolio 
          and maximize yield across the Avalanche ecosystem.
        </p>
        
        <div className="flex flex-wrap gap-4 mt-8">
          {actions.map((action: any) => (
            <TemplateCard key={action._id} template={action} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Agents;
