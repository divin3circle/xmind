"use client";

import Image from "next/image";
import { Agent } from "@/lib/utils";
import { IconCalculator, IconPlus, IconStarFilled } from "@tabler/icons-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

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
      onClick={() => router.push(`/chat/${agent._id}`)}
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
                src={agent.image}
                alt={agent.agentName}
                width={40}
                placeholder="blur"
                height={40}
                className="w-7 h-7 object-cover"
                priority={false}
              />
            </div>

            <div className="">
              <h2 className="font-sans font-semibold text-sm">
                {agent.agentName}
              </h2>
              <p className="text-xs font-sans text-muted-foreground">
                {agent.creatorAddress}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-2">
          {agent.tagline && (
            <p className="text-xs font-sans text-muted-foreground font-semibold">
              {agent.tagline}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/chat/${agent._id}`)}
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
                src={agent.image}
                alt={agent.agentName}
                placeholder="blur"
                width={40}
                height={40}
                className="w-7 h-7 object-cover"
                priority={false}
              />
            </div>

            <div className="">
              <h2 className="font-sans font-semibold text-sm">
                {agent.agentName}
              </h2>
              <p className="text-xs font-sans text-muted-foreground">
                {agent.creatorAddress}
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
            <p className="text-xs font-sans text-muted-foreground">Earned</p>
            <p className="font-sans text-xs font-semibold">
              {formatBigNumberToReducedString(BigInt(agent.totalEarned))} USDC.e
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-sans text-muted-foreground">
              Avg. Rating
            </p>
            <p className="font-sans flex items-center justify-end text-xs font-semibold">
              {(
                agent.ratings.reduce((a, b) => a + b, 0) / agent.ratings.length
              ).toFixed(1)}
              <IconStarFilled
                size={14}
                className="inline-block ml-1 text-yellow-500"
              />
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-sans text-muted-foreground">
              Tasks Completed
            </p>
            <p className="font-sans flex items-center justify-end text-xs font-semibold">
              {agent.tasksCompleted}
              <IconCalculator
                size={14}
                className="inline-block ml-1 text-foreground"
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentCard;
