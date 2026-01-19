import React from "react";
import FeatureCard from "./feature-card";

const features = [
  {
    title: "Create an Agent",
    tagline: "Deploy a Helpful MCP AI Agent",
    description:
      "With xMind, you can easily create and deploy your own MCP AI Agent on the Cronos and use it to automate repeated tasks, process real-world data, or enhance user engagement in your dApps.",
    imageUrl: "/feature2.avif",
  },
  {
    title: "Yield & Pool Information",
    tagline: "Find the Best Opportunities Fast",
    description:
      "xMind MCP AI Agent scans live Cronos EVM pools and farms on VVS and H2 protocols and provides yield optimization suggestions in plain English, so you can maximize returns without endless research.",
    imageUrl: "/feature2.webp",
  },
  {
    title: "Cronos Chain Information",
    tagline: "Get Instant Answers",
    description:
      "xMind uses Crypto.com Developer SDK and AI SDK to provide instant, accurate answers to your questions about the Cronos EVM blockchain, wallets, transactions, contracts, and dApps in plain English.",
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
