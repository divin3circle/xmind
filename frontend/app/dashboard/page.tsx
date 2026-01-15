import { IconPlus } from "@tabler/icons-react";
import MyAgents from "./agents";
import Earnings from "./earnings";
import History from "./history";
import DashboardNavbar from "./navbar";
import Tasks from "./tasks";

function Dashboard() {
  return (
    <div className="max-w-7xl relative mx-auto my-0">
      <DashboardNavbar />
      <Earnings />
      <MyAgents />
      <Tasks />
      <History />
      <div className="fixed border-dashed border-green-500 border w-12 h-12 bottom-3 right-10 md:right-16 flex items-center justify-center backdrop-blur-lg">
        <IconPlus className="m-3 text-muted-foreground" />
      </div>
    </div>
  );
}

export default Dashboard;
