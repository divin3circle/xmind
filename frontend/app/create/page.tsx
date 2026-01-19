import React from "react";
import DashboardNavbar from "../dashboard/navbar";
import { CreateAgentForm } from "./create-agent-form";
import { IconPlus } from "@tabler/icons-react";

function CreateAgent() {
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
