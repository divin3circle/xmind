import Image from "next/image";
import { Agent } from "./agents";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "./ui/button";

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

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="border border-dashed p-4 md:w-68 w-full flex flex-col justify-between relative group hover:bg-green-500/10 transition-all duration-500 hover:scale-95 hover:shadow-xs shadow-green-500">
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
                width={50}
                height={50}
                className="w-7 h-7 object-cover "
              />
            </div>

            <div className="">
              <h2 className="font-sans font-semibold text-sm">
                {agent.agentName}
              </h2>
              <p className="text-xs font-mono text-muted-foreground">
                {agent.agentAddress}
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
        <p className="mt-6 font-mono text-xs text-muted-foreground">
          An autonomous software system that perceives its environment, reasons,
          plans, and acts independently.
        </p>
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-muted-foreground">
              Current Balance
            </p>
            <p className="font-mono text-xs font-semibold">
              {formatBigNumberToReducedString(BigInt(agent.availableBalance))}{" "}
              USDC.e
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-muted-foreground">
              YTD Revenue
            </p>
            <p className="font-mono text-xs font-semibold">
              {formatBigNumberToReducedString(BigInt(agent.totalEarned))} USDC.e
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-muted-foreground">
              Latest Earnings
            </p>
            <p className="font-mono text-xs font-semibold">
              {formatBigNumberToReducedString(
                BigInt(
                  agent.withdrawalHistory.length > 0
                    ? agent.withdrawalHistory[
                        agent.withdrawalHistory.length - 1
                      ].amount
                    : "0"
                )
              )}{" "}
              USDC.e
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentCard;
