"use client";
import { useMyAgents } from "@/hooks/useMyAgents";
import DashboardNavbar from "../dashboard/navbar";
import { CreateAgentForm } from "./create-agent-form";
import { IconPlus } from "@tabler/icons-react";
import { useActiveAccount } from "thirdweb/react-native";
import { Loader2Icon } from "lucide-react";
import config from "@/config/env";

function CreateAgent() {
  const { agents, loading } = useMyAgents();
  const activeAccount = useActiveAccount();

  if (!activeAccount?.address) {
    return (
      <div className="max-w-7xl relative mx-auto my-0">
        <DashboardNavbar />
        <div className="flex items-center justify-center flex-col w-full px-2 h-[90vh]">
          <div className="border mt-8 relative border-dashed p-4 w-full md:w-2xl text-center">
            <IconPlus className="absolute -top-3 -right-3" color="gray" />
            <IconPlus className="absolute -top-3 -left-3" color="gray" />
            <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
            <IconPlus className="absolute -bottom-3 -left-3" color="gray" />

            <h2 className="font-sans font-semibold text-sm">
              Please connect your wallet to create an agent.
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl relative mx-auto my-0">
        <DashboardNavbar />
        <div className="flex items-center justify-center flex-col w-full px-2 h-[90vh]">
          <div className="border mt-8 relative border-dashed p-4 w-full md:w-2xl text-center">
            <IconPlus className="absolute -top-3 -right-3" color="gray" />
            <IconPlus className="absolute -top-3 -left-3" color="gray" />
            <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
            <IconPlus className="absolute -bottom-3 -left-3" color="gray" />

            <div className="flex items-center justify-center">
              <Loader2Icon className="animate-spin mr-2" />
              <span className="font-sans text-xs">Just a moment</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (agents && agents.length >= config.ALLOWED_AGENTS_PER_USER) {
    return (
      <div className="max-w-7xl relative mx-auto my-0">
        <DashboardNavbar />
        <div className="flex items-center justify-center flex-col w-full px-2 h-[90vh]">
          <div className="border mt-8 relative border-dashed p-4 w-full md:w-2xl text-center">
            <IconPlus className="absolute -top-3 -right-3" color="gray" />
            <IconPlus className="absolute -top-3 -left-3" color="gray" />
            <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
            <IconPlus className="absolute -bottom-3 -left-3" color="gray" />

            <h2 className="font-sans font-semibold text-sm">
              You have reached the maximum number of agents allowed (
              {agents.length}/{config.ALLOWED_AGENTS_PER_USER}).
            </h2>
            <p className="mt-4 text-muted-foreground text-xs">
              Please contact support if you wish to create more agents.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl relative mx-auto my-0">
      <DashboardNavbar />
      <div className="flex items-center justify-center flex-col w-full px-2 h-[90vh]">
        <div className="border mt-8 relative border-dashed p-4 w-full md:w-2xl">
          <IconPlus className="absolute -top-3 -right-3" color="gray" />
          <IconPlus className="absolute -top-3 -left-3" color="gray" />
          <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
          <IconPlus className="absolute -bottom-3 -left-3" color="gray" />

          <CreateAgentForm />
        </div>
      </div>
    </div>
  );
}

export default CreateAgent;
