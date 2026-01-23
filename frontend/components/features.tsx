import React from "react";
import FeatureCard from "./feature-card";

const features = [
  {
    title: "Launch Paid Agents",
    tagline: "Deploy on-chain in minutes",
    description:
      "Spin up Cronos-native MCP agents with wallets, contracts, and prompts baked in. Own the contract, track earnings, and update capabilities without touching infra.",
    imageUrl: "/feature2.avif",
  },
  {
    title: "x402 Paywalls & Micropayments",
    tagline: "Meter every interaction",
    description:
      "Agents natively use HTTP 402 + EIP-3009 to charge per request. Issue payment headers, verify, settle, and record earnings automatically in USDC.e.",
    imageUrl: "/feature2.webp",
  },
  {
    title: "Web3 Superpowers",
    tagline: "DeFi, wallets, bridging, chat",
    description:
      "MCP server ships 30+ tools: VVS/H2 pools, balances, transfers, Cronos ID, bridge routes, ABI lookups, simulations, and secure task logging for each agent.",
    imageUrl: "/feature3.jpg",
  },
];

function Features() {
  return (
    <section className="my-24 mx-4">
      <div className="flex flex-col items-start mb-12 justify-start ">
        <h1 className="text-xl font-bold font-sans text-left mb-2">
          Platform Features
        </h1>
        <p className="text-left max-w-2xl font-sans text-xs text-muted-foreground ">
          Trustless escrow, AI-driven task completion, and gas-efficient Cronos
          blockchain integration at your service.
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:gap-4 justify-between">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            tagline={feature.tagline}
            description={feature.description}
            imageUrl={feature.imageUrl}
          />
        ))}
      </div>
    </section>
  );
}

export default Features;
