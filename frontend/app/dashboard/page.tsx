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
    </div>
  );
}

export default Dashboard;
