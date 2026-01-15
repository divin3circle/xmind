import React from "react";
import { IconChevronsDown, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import AgentCard from "@/components/agent-card";
import { Input } from "@/components/ui/input";

export interface Agent {
  agentName: string;
  image: string;
  creatorAddress: string;
  agentAddress: string;
  totalEarned: string;
  totalWithdrawn: string;
  availableBalance: string;
  registrationFeePaid: string;
  registrationFeePaidTxHash?: string;
  registrationPaidAt?: string;
  lastWithdrawalAt?: string;
  withdrawalHistory: {
    amount: string;
    txHash?: string;
    withdrawnAt?: string;
  }[];
}

const mockAgents: Agent[] = [
  {
    agentName: "Zephyr Ops",
    image: "/ai-agent2.webp",
    creatorAddress: "0x9f2c...a1b3",
    agentAddress: "0x8a7d...fe42",
    totalEarned: "12500000000000",
    totalWithdrawn: "7500000000000",
    availableBalance: "5000000000000",
    registrationFeePaid: "1000000000000",
    registrationFeePaidTxHash: "0xfee1deadbeef",
    registrationPaidAt: "2025-12-10T12:30:00Z",
    lastWithdrawalAt: "2025-12-20T09:15:00Z",
    withdrawalHistory: [
      {
        amount: "5000000000000",
        txHash: "0xbeadfeed",
        withdrawnAt: "2025-12-15T08:00:00Z",
      },
      {
        amount: "2500000000000",
        txHash: "0xdecafbad",
        withdrawnAt: "2025-12-20T09:15:00Z",
      },
    ],
  },
  {
    agentName: "Aurora Nexus",
    creatorAddress: "0x1c3d...b4e6",
    image: "/ai-agent.jpg",
    agentAddress: "0x4f6a...c9d0",
    totalEarned: "9800000000000",
    totalWithdrawn: "4800000000000",
    availableBalance: "5000000000000",
    registrationFeePaid: "1000000000000",
    registrationFeePaidTxHash: "0xba5eba11",
    registrationPaidAt: "2025-11-05T15:45:00Z",
    lastWithdrawalAt: "2025-12-18T10:05:00Z",
    withdrawalHistory: [
      {
        amount: "3000000000000",
        txHash: "0xabc123",
        withdrawnAt: "2025-12-01T14:20:00Z",
      },
      {
        amount: "1800000000000",
        txHash: "0xdef456",
        withdrawnAt: "2025-12-18T10:05:00Z",
      },
    ],
  },
];

function MyAgents() {
  return (
    <section className="mt-14">
      <div className="py-8 mx-2 border mt-8 relative border-dashed px-4 overflow-hidden">
        <IconPlus className="absolute -top-3 -right-3" color="gray" />
        <IconPlus className="absolute -top-3 -left-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -left-3" color="gray" />

        <h1 className="text-xl font-bold font-sans text-left">My Agents</h1>
        <p className="text-muted-foreground text-xs font-sans max-w-md leading-relaxed mt-1">
          Browse or search agents by category
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
            <AgentCard key={agent.agentAddress} agent={agent} />
          ))}
        </div>
      </div>
      <div className="px-4">
        <Button
          variant="outline"
          className="mt-4 w-full max-w-md mx-auto flex items-center gap-2 border-dashed border"
        >
          See More <IconChevronsDown />
        </Button>
      </div>
    </section>
  );
}

export default MyAgents;
