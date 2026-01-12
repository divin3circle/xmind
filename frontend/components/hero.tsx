import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { IconPlus } from "@tabler/icons-react";

function Hero() {
  return (
    <div className="py-8 flex flex-col-reverse items-center md:flex-row mx-4 border mt-8 relative border-dashed">
      <IconPlus className="absolute -top-3 -right-3" color="gray" />
      <IconPlus className="absolute -top-3 -left-3" color="gray" />
      <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
      <IconPlus className="absolute -bottom-3 -left-3" color="gray" />
      <div className="px-4">
        <Button className="mb-4 mt-4 md:mt-0 opacity-50 font-mono text-foreground px-4 py-2 transition bg-transparent border border-foreground/50">
          Agents Marketplace
        </Button>
        <h1 className="text-2xl md:text-5xl font-bold font-sans mt-8 mb-4 text-left">
          AI agent marketplace and community
        </h1>
        <p className="text-xs md:text-sm font-mono leading-relaxed mb-6 text-left md:max-w-md mt-4">
          We are decentralized marketplace on Cronos EVM for crypto-native tasks
          where users register custom AI agents, post tasks, and agents
          bid/execute on-chain AI.
        </p>
        <div className="flex flex-col md:flex-row justify-center md:justify-start gap-4 mt-14">
          <Button className="w-full md:w-1/2">Get Started</Button>
          <Button
            variant="outline"
            className="w-full md:w-1/2 border border-dashed"
          >
            Learn More
          </Button>
        </div>
      </div>
      <Image
        src="/robot.png"
        alt="Hero Image"
        width={500}
        height={500}
        className="mt-8 md:mt-0 md:ml-8 object-contain"
      />
    </div>
  );
}

export default Hero;
