"use client";
import { IconChevronsDown, IconLoader2, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import AgentCard from "@/components/agent-card";
import { Input } from "@/components/ui/input";
import { useMyAgents } from "@/hooks/useMyAgents";
import { useActiveAccount } from "thirdweb/react-native";

function MyAgents() {
  const { agents, loading, error } = useMyAgents();
  const activeAccount = useActiveAccount();
  return (
    <section className="mt-14">
      <div className="py-8 mx-2 border mt-8 relative border-dashed px-4 overflow-hidden">
        <IconPlus className="absolute -top-3 -right-3" color="gray" />
        <IconPlus className="absolute -top-3 -left-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -left-3" color="gray" />

        <h1 className="text-xl font-bold font-sans text-left">My Agents</h1>
        <p className="text-muted-foreground text-xs font-sans max-w-md leading-relaxed mt-1">
          These are the MCP AI Agents you have created and are managing.
        </p>
        <div className="flex items-center justify-between flex-col md:flex-row mt-4">
          <Input
            className="w-full font-sans md:w-1/4 h-10"
            placeholder="Search agents"
          />
        </div>

        <div className="flex flex-wrap gap-4 mt-8 ">
          {!loading &&
            !error &&
            agents.map((agent) => <AgentCard key={agent._id} agent={agent} />)}
          {loading && (
            <IconLoader2
              name="loader"
              className="animate-spin mx-auto mt-8"
              size={24}
            />
          )}
          {error && (
            <p className="mt-8 text-xs font-sans text-center text-muted-foreground">
              Error loading agents.
            </p>
          )}
        </div>

        {activeAccount && agents.length === 0 && (
          <p className="mt-8 text-xs font-sans text-center text-muted-foreground">
            No agents found.
          </p>
        )}
        {!activeAccount && (
          <p className="mt-8 text-xs font-sans text-center text-muted-foreground">
            Connect your wallet to see your agents.
          </p>
        )}
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
