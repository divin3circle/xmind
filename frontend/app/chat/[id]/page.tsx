"use client";
import DashboardNavbar from "@/app/dashboard/navbar";
import { useParams } from "next/navigation";
import React from "react";
import WelcomeChat from "./welcome";

function AgentChatPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-7xl mx-auto my-0">
      <DashboardNavbar />
      <div className="w-full flex items-center justify-center flex-col">
        <WelcomeChat id={id} />
      </div>
    </div>
  );
}

export default AgentChatPage;
