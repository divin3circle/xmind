"use client";
import DashboardNavbar from "../dashboard/navbar";
import { AgentSelectorCard } from "@/components/agent-card";
import { mockAgents } from "@/components/agents";

function ChatPage() {
  return (
    <div className="max-w-7xl mx-auto my-0">
      <DashboardNavbar />
      <div className="h-[90vh] flex items-center justify-center flex-col px-4">
        <h1 className="text-2xl font-bold font-sans">Welcome to xMind Chat</h1>
        <p className="text-muted-foreground font-sans text-sm">
          Choose one of the agents below to start.
        </p>
        <div className="flex flex-wrap gap-4 mt-8 max-w-4xl">
          {mockAgents.map((agent) => (
            <AgentSelectorCard key={agent._id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
