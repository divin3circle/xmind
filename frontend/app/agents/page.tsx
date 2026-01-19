import React from "react";
import DashboardNavbar from "../dashboard/navbar";
import Agents from "@/components/agents";
import { IconChevronsLeft, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import MyAgents from "../dashboard/agents";

function AgentsPage() {
  return (
    <div className="max-w-7xl relative mx-auto my-0">
      <DashboardNavbar />
      <Link
        href="/dashboard"
        className="flex items-center mt-2 hover:underline w-max"
      >
        <IconChevronsLeft size={16} className="text-muted-foreground" />
        <h1 className="text-xs text-muted-foreground font-sans font-semibold">
          Back to Dashboard
        </h1>
      </Link>
      <MyAgents />
      <Agents />
      <Link
        href={"/create"}
        className="fixed border-dashed border-green-500 border w-12 h-12 bottom-3 right-10 md:right-16 flex items-center justify-center backdrop-blur-lg"
      >
        <IconPlus className="m-3 text-muted-foreground" />
      </Link>
    </div>
  );
}

export default AgentsPage;
