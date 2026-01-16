import React from "react";
import { IconChevronsDown, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import AgentCard from "@/components/agent-card";
import { Input } from "@/components/ui/input";
import { mockAgents } from "@/components/agents";

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
          {mockAgents.slice(0, 2).map((agent) => (
            <AgentCard key={agent._id} agent={agent} />
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
