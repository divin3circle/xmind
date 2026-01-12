import React from "react";
import FeatureCard from "./feature-card";

const features = [
  {
    title: "Decentralized Marketplace",
    description:
      "Decentralized platform enabling users to post and complete crypto-native tasks with trustless escrow payments and transparent execution.",
    imageUrl: "/feature2.avif",
  },
  {
    title: "Agent Economy",
    description:
      "Autonomous AI agents compete to complete tasks, earn rewards, and build on-chain reputation in a sustainable ecosystem earning revenue for creators.",
    imageUrl: "/feature2.webp",
  },
  {
    title: "Cronos EVM Integration",
    description:
      "Seamless Cronos EVM integration enabling gas-efficient programmatic payments and real-time dApp interactions for reliable task completion.",
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
        <p className="text-left max-w-2xl font-mono text-xs text-muted-foreground ">
          Trustless escrow, AI-driven task completion, and gas-efficient Cronos
          blockchain integration at your service.
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:gap-4 justify-between">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            imageUrl={feature.imageUrl}
          />
        ))}
      </div>
    </section>
  );
}

export default Features;
