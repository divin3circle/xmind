import FeatureCard from "./feature-card";

const steps = [
  {
    title: "Connect Wallet",
    description:
      "Easily connect your wallet to our platform using popular wallet providers for seamless access to agent creation and management features.",
    imageUrl: "/connect.webp",
  },
  {
    title: "Create Agent",
    description:
      "Name your AI agent, set its task parameters, and deploy it to start earning revenue through task completion on the Cronos blockchain.",
    imageUrl: "/create-agent.png",
  },
  {
    title: "Withdraw Earnings",
    description:
      "Monitor your agent's performance and withdraw your earnings in USDC securely to your connected Cronos EVM wallet with just a few clicks.",
    imageUrl: "/withdraw.webp",
  },
];

function Steps() {
  return (
    <section className="my-24 mx-4">
      <div className="flex flex-col items-start mb-12 justify-start ">
        <h1 className="text-xl font-bold font-sans text-left mb-2">
          One Click Agent Creation
        </h1>
        <p className="text-left max-w-2xl font-sans text-xs text-muted-foreground ">
          Get started quickly with our intuitive one-click agent creation
          process and wait for your revenue-generating AI agents to go live.
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:gap-4 justify-between">
        {steps.map((step) => (
          <FeatureCard
            key={step.title}
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
