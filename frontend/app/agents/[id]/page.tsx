"use client";
import { useParams } from "next/navigation";
import DashboardNavbar from "../../dashboard/navbar";
import { AgentWelcome } from "./agent-welcome";

function AgentPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-7xl relative mx-auto my-0">
      <DashboardNavbar />
      <div className="flex items-center justify-center">
        <AgentWelcome agentId={id} />
      </div>
    </div>
  );
}

export default AgentPage;
