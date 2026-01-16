import React from "react";
import { IconChevronsDown, IconPlus } from "@tabler/icons-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import AgentCard from "./agent-card";

export interface Agent {
  _id?: string;
  agentName: string;
  image: string;
  creatorAddress: string;
  description: string;
  tasksCompleted: number;
  totalEarned: string;
  ratings: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const mockAgents: Agent[] = [
  {
    _id: "1",
    agentName: "Zephyr Ops",
    image: "/ai-agent2.webp",
    creatorAddress: "0x9f2c...a1b3",
    description:
      "Zephyr helps you executes the transaction in a safe sandbox, and returns a plain-English summary with clear warnings.",
    totalEarned: "12500000000000",
    tasksCompleted: 150,
    ratings: [5, 4, 5, 5, 4],
  },
  {
    _id: "2",
    agentName: "Aurora Nexus",
    creatorAddress: "0x1c3d...b4e6",
    description:
      "Aurora scans pools and farms analyzes APY, TVL, risks, and short-term trends, then ranks the top 5 yield opportunities.",
    image: "/ai-agent.jpg",
    totalEarned: "800000000000",
    tasksCompleted: 95,
    ratings: [4, 4, 5, 3, 4],
  },
  {
    _id: "3",
    agentName: "Zk Staks",
    creatorAddress: "0x2e5f...d8c2",
    description:
      "Zk Staks uses natural language to generate the perfect ERC-4337 UserOperation bundle (approve + swap + stake in one signature).",
    image: "/staks.jpeg",
    totalEarned: "6500000000000",
    tasksCompleted: 120,
    ratings: [5, 5, 4, 5, 5],
  },
  {
    _id: "4",
    agentName: "Omni",
    creatorAddress: "0x7a4b...e3f9",
    description:
      "Omni checks real-time liquidity depth on official bridges, third-party bridges and CEX withdrawal fees returning a route that saves you the most on slippage and gas.",
    image: "/omni.jpeg",
    totalEarned: "7200000000000",
    tasksCompleted: 135,
    ratings: [5, 4, 5, 4, 5],
  },
];

function Agents() {
  return (
    <section className="my-24">
      <div className="py-8 mx-4 border mt-8 relative border-dashed px-4 overflow-hidden">
        <IconPlus className="absolute -top-3 -right-3" color="gray" />
        <IconPlus className="absolute -top-3 -left-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -left-3" color="gray" />

        <h1 className="text-xl font-bold font-sans text-left">
          Available Agents
        </h1>
        <p className="text-muted-foreground text-xs font-sans max-w-md leading-relaxed mt-1">
          Don&apos;t see an agent that fits your needs? Agent creation coming
          soon
        </p>
        <div className="flex items-center justify-between flex-col md:flex-row mt-4">
          <Input
            className="w-full font-sans md:w-1/4 h-10"
            placeholder="Search agents"
          />
          <div className="mt-4 md:mt-0 font-sans text-xs text-muted-foreground flex items-center justify-between w-full md:w-auto">
            <Button
              variant="outline"
              className="border border-dashed font-semibold flex h-10 items-center gap-2 w-1/3 md:w-auto"
            >
              Reputation <IconChevronsDown />
            </Button>
            <Button
              variant="outline"
              className="border border-dashed font-semibold flex items-center gap-2 h-10 w-1/3 md:w-auto"
            >
              Tasks <IconChevronsDown />
            </Button>
            <Button
              variant="outline"
              className="border border-dashed font-semibold flex items-center gap-2 h-10 w-1/3 md:w-auto"
            >
              Revenue <IconChevronsDown />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-8 ">
          {mockAgents.map((agent) => (
            <AgentCard key={agent._id} agent={agent} />
          ))}
        </div>
      </div>
      <div className="px-4">
        <Button
          variant="outline"
          className="mt-8 w-full max-w-md mx-auto flex items-center gap-2 border-dashed border"
        >
          See More <IconChevronsDown />
        </Button>
      </div>
    </section>
  );
}

export default Agents;
