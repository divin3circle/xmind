import Link from "next/link";
import MyAgents from "./agents";
import Earnings from "./earnings";
import History from "./history";
import DashboardNavbar from "./navbar";
import Tasks from "./tasks";
import { IconPlus } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function Dashboard() {
  return (
    <div className="max-w-7xl relative mx-auto my-0">
      <DashboardNavbar />
      <Earnings />
      <MyAgents />
      <Tasks />
      <History />
      <Link
        href={"/chat"}
        className="fixed border-dashed border-green-500 border w-12 h-12 bottom-3 right-10 md:right-16 flex items-center justify-center backdrop-blur-lg"
      >
        <Tooltip>
          <TooltipTrigger className="bg-transparent">
            <IconPlus className="m-3 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="bg-transparent backdrop-blur-2xl border border-dashed border-green-500 p-2">
            <p className="text-xs font-semibold font-sans text-foreground">
              Start Chat
            </p>
          </TooltipContent>
        </Tooltip>
      </Link>
    </div>
  );
}

export default Dashboard;
