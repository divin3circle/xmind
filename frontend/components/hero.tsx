"use client";
import Image from "next/image";
import { Button } from "./ui/button";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import robotImage from "../public/robot.png";

function Hero() {
  const router = useRouter();
  return (
    <div className="py-8 flex flex-col-reverse items-center md:flex-row mx-4 overflow-hidden border mt-8 relative border-dashed">
      <IconPlus className="absolute -top-3 -right-3" color="gray" />
      <IconPlus className="absolute -top-3 -left-3" color="gray" />
      <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
      <IconPlus className="absolute -bottom-3 -left-3" color="gray" />
      <div className="px-4">
        <Button className="mb-4 mt-4 md:mt-0 opacity-50 font-sans text-foreground px-4 py-2 transition bg-transparent border border-foreground/50">
          Avalanche
        </Button>
        <h1 className="text-2xl md:text-5xl font-bold font-sans mt-8 mb-4 text-left">
          Deploy & invest in AI-managed tokenized vaults
        </h1>
        <p className="text-xs md:text-sm font-sans leading-relaxed mb-6 text-left md:max-w-md mt-4">
          Launch autonomous ERC-4626 portfolios on Avalanche with verifiable AI 
          execution. Deploy on-chain vault managers, enforce risk guardrails, 
          and monitor your yield across chains from one professional dashboard. 
          No custody risks—just smart, trustless capital management.
        </p>
        <div className="flex flex-col md:flex-row justify-center md:justify-start gap-4 mt-14">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full md:w-1/2"
          >
            Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              router.push("https://github.com/divin3circle/bazaar")
            }
            className="w-full md:w-1/2 border border-dashed"
          >
            Learn More
          </Button>
        </div>
      </div>
      <Image
        src={robotImage}
        alt="Hero Image"
        width={500}
        height={500}
        priority
        placeholder="blur"
        sizes="(max-width: 768px) 100vw, 500px"
        className="mt-8 md:mt-0 md:ml-8 object-contain"
      />
    </div>
  );
}

export default Hero;
