"use client";

import Image from "next/image";
import { Agent } from "@/lib/utils";
import { IconCalculator, IconPlus, IconStarFilled } from "@tabler/icons-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { RiskProfile } from "@/lib/types/vault";

function formatBigNumberToReducedString(value: bigint): string {
  const USDC_DECIMALS = 1_000_000n;
  const num = Number(value / USDC_DECIMALS);

  if (num >= 1_000_000_000) {
    return (
      (num / 1_000_000_000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "B"
    );
  } else if (num >= 1_000_000) {
    return (
      (num / 1_000_000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "M"
    );
  } else if (num >= 1_000) {
    return (
      (num / 1_000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "K"
    );
  } else {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}

export function AgentSelectorCard({ agent }: { agent: Agent }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/agents/${agent._id}`)}
      className="border cursor-pointer border-dashed p-4 md:w-68 w-full flex flex-col justify-between relative group hover:bg-green-500/10 transition-all overflow-hidden  duration-500 "
    >
      <IconPlus
        className="absolute -top-3 -right-3 rotate-45 group-hover:rotate-90 transition-transform duration-500"
        color="gray"
      />
      <IconPlus
        className="absolute -top-3 -left-3 rotate-45 group-hover:rotate-90 transition-transform duration-500"
        color="gray"
      />
      <IconPlus
        className="absolute -bottom-3 -right-3 rotate-45 group-hover:rotate-90 transition-transform duration-500"
        color="gray"
      />
      <IconPlus
        className="absolute -bottom-3 -left-3 rotate-45 group-hover:rotate-90 transition-transform duration-500"
        color="gray"
      />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="border border-dashed p-1">
              <Image
                src={agent.image || "/placeholder-agent.png"}
                alt={agent.name || "Agent Image"}
                width={40}
                height={40}
                className="w-7 h-7 object-cover"
                priority={false}
              />
            </div>

            <div className="">
              <h2 className="font-sans font-semibold text-sm">
                {agent.name}
              </h2>
              <p className="text-xs font-sans text-muted-foreground">
                {agent.creatorAddress.slice(0, 6)}...
                {agent.creatorAddress.slice(-4)}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-2">
          {agent.description && (
            <p className="text-xs font-sans text-muted-foreground font-semibold">
              {agent.description.slice(0, 60)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const FUJI_TOKENS: Record<string, string> = {
  "0x5425890298aed601595a70ab815c96711a31bc65": "USDC",
  "0xd00ae08403b9bbb9124bb305c09058e32c39a48c": "WAVAX",
};

function AgentCard({ agent }: { agent: Agent }) {
  const router = useRouter();
  
  const targetAssetSymbol = agent.underlyingToken 
    ? FUJI_TOKENS[agent.underlyingToken.toLowerCase()] || "Unknown"
    : "USDC";

  return (
    <div
      onClick={() => router.push(`/agents/${agent._id}`)}
      className="border cursor-pointer border-dashed p-4 md:w-68 w-full flex flex-col justify-between relative group hover:bg-green-500/10 transition-all  duration-500 "
    >
      <IconPlus
        className="absolute -top-3 -right-3 rotate-45 group-hover:rotate-90 transition-transform duration-500"
        color="gray"
      />
      <IconPlus
        className="absolute -top-3 -left-3 rotate-45 group-hover:rotate-90 transition-transform duration-500"
        color="gray"
      />
      <IconPlus
        className="absolute -bottom-3 -right-3 rotate-45 group-hover:rotate-90 transition-transform duration-500"
        color="gray"
      />
      <IconPlus
        className="absolute -bottom-3 -left-3 rotate-45 group-hover:rotate-90 transition-transform duration-500"
        color="gray"
      />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="border border-dashed p-1">
              <Image
                src={agent.image || "/placeholder-agent.png"}
                alt={agent.name || "Agent Image"}
                width={40}
                height={40}
                className="w-7 h-7 object-cover"
                priority={false}
              />
            </div>

            <div className="">
              <h2 className="font-sans font-semibold text-sm">{agent.name}</h2>
              <p className="text-xs font-sans text-muted-foreground">
                {agent.creatorAddress.slice(0, 6)}...
                {agent.creatorAddress.slice(-4)}
              </p>
            </div>
          </div>
          <Button
            className="border border-dashed"
            variant="outline"
            size="icon"
          >
            <IconPlus className="text-foreground group-hover:rotate-45 transition-transform duration-500" />
          </Button>
        </div>
        <p className="mt-6 font-sans text-xs text-muted-foreground">
          {agent.description}
        </p>
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-sans text-muted-foreground">Risk Profile</p>
            <p className={`font-sans text-[10px] uppercase font-bold px-2 py-0.5 border border-dashed ${
              agent.riskProfile === RiskProfile.AGGRESSIVE ? 'text-red-500 border-red-500' : 
              agent.riskProfile === RiskProfile.BALANCED ? 'text-yellow-500 border-yellow-500' : 
              'text-green-500 border-green-500'
            }`}>
              {agent.riskProfile}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-sans text-muted-foreground">
              Target Asset
            </p>
            <p className="font-sans flex items-center justify-end text-xs font-semibold uppercase">
              {targetAssetSymbol}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-sans text-muted-foreground">
              Vault Address
            </p>
            <p className="font-sans flex items-center justify-end text-[10px] font-mono opacity-50">
              {agent.vaultAddress.slice(0, 6)}...{agent.vaultAddress.slice(-4)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentCard;
