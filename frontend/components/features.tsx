import React from "react";
import FeatureCard from "./feature-card";

const features = [
  {
    title: "Transaction Simulator",
    tagline: "Stop Signing Blindly",
    description:
      "Paste any calldata or contract interaction — xMind forks the current Cronos zkEVM state, executes the transaction in a safe sandbox, and returns a plain-English summary with clear warnings.",
    imageUrl: "/feature2.avif",
  },
  {
    title: "Yield & Pool Optimizer",
    tagline: "Find the Best Opportunities Fast",
    description:
      "xMind scans live Cronos pools and farms analyzes APY, TVL, impermanent loss risk, and short-term trends, then ranks the top 5 yield opportunities optimized for your chosen time horizon.",
    imageUrl: "/feature2.webp",
  },
  {
    title: "One-Click Account Abstraction Bundler",
    tagline: "Turn Ideas into Bundled Actions",
    description:
      "xMind uses natural language to generate the perfect ERC-4337 UserOperation bundle (approve + swap + stake in one signature). You sign once instead of juggling multiple transactions, saving gas and time.",
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
