import FeatureCard from "./feature-card";

const steps = [
  {
    title: "Connect Wallet",
    tagline: "",
    description:
      "Easily connect your wallet to our platform using popular wallet providers for seamless access to agents and management features.",
    imageUrl: "/connect.webp",
  },
  {
    title: "Call an Agent",
    tagline: "",
    description:
      "Chat with our MCP AI Agent, based on your needs, and initiate tasks with just a few clicks. Or create your own agent based on our templates.",
    imageUrl: "/create-agent.png",
  },
  {
    title: "x402 Payment",
    tagline: "",
    description:
      "The Agents receive and process payments using the x402 Protocol available on zkCronos Blockchain, ensuring secure and cheap transactions.",
    imageUrl: "/withdraw.webp",
  },
];

function Steps() {
  return (
    <section className="my-24 mx-4">
      <div className="flex flex-col items-start mb-12 justify-start ">
        <h1 className="text-xl font-bold font-sans text-left mb-2">
          One Click Agent Interaction & Creation
        </h1>
        <p className="text-left max-w-2xl font-sans text-xs text-muted-foreground ">
          Get started quickly with our intuitive one-click agent interaction
          process designed for ease of use.
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
