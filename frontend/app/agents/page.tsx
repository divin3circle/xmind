import React from "react";
import DashboardNavbar from "../dashboard/navbar";
import Agents from "@/components/agents";
import { IconChevronsLeft } from "@tabler/icons-react";
import Link from "next/link";

function AgentsPage() {
  return (
    <div className="max-w-7xl mx-auto my-0">
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
      <Agents />
    </div>
  );
}

export default AgentsPage;
