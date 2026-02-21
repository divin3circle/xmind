import FeatureCard from "./feature-card";

const steps = [
  {
    title: "Connect Wallet",
    tagline: "",
    description:
      "Connect your wallet to Avalanche C-Chain. Your funds remain under your custody in specialized ERC-4626 vaults at all times.",
    imageUrl: "/connect.webp",
  },
  {
    title: "Select AI Strategy",
    tagline: "",
    description:
      "Choose from various tokenized AI agents with different risk profiles. Review their strategy, performance history, and on-chain risk guardrails.",
    imageUrl: "/create-agent.png",
  },
  {
    title: "Earn Automated Yield",
    tagline: "",
    description:
      "The AI Agent executes trades across DEXs and bridges autonomously. Sit back as your vault shares reflect the generate profit and yield.",
    imageUrl: "/withdraw.webp",
  },
];

function Steps() {
  return (
    <section className="my-24 mx-4">
      <div className="flex flex-col items-start mb-12 justify-start ">
        <h1 className="text-xl font-bold font-sans text-left mb-2">
          One Click Portfolio Interaction
        </h1>
        <p className="text-left max-w-2xl font-sans text-xs text-muted-foreground ">
          Get started quickly with our intuitive process for selecting and 
          participating in AI-managed investment strategies.
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:gap-4 justify-between">
        {steps.map((step) => (
          <FeatureCard
            key={step.title}
            tagline={step.tagline}
            title={step.title}
            description={step.description}
            imageUrl={step.imageUrl}
          />
        ))}
      </div>
    </section>
  );
}

export default Steps;
