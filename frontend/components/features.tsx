import React from "react";
import FeatureCard from "./feature-card";

const features = [
  {
    title: "Tokenized AI Portfolios",
    tagline: "ERC-4626 Vault Infrastructure",
    description:
      "Every AI strategy is deployed as a unique ERC-4626 vault. Hold shares in AI-managed treasuries while maintaining full on-chain transparency and ownership.",
    imageUrl: "/feature2.avif",
  },
  {
    title: "Configurable Risk Guardrails",
    tagline: "Safe & Autonomous Execution",
    description:
      "Conservative, Balanced, and Aggressive profiles with strict allocation limits. Our on-chain RiskValidator ensures AI trades always stay within your safety parameters.",
    imageUrl: "/feature2.webp",
  },
  {
    title: "Cross-Chain Execution",
    tagline: "Powered by Chainlink CCIP",
    description:
      "Maximize yield opportunities across Avalanche, Base, Arbitrum, and more. AI agents allocate capital across chains and return profits to your home vault.",
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
          Verifiable AI logic, autonomous cross-chain capital allocation, and 
          auditable trade reasoning on the Avalanche blockchain.
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
