import MyAgents from "./agents";
import Earnings from "./earnings";
import History from "./history";
import DashboardNavbar from "./navbar";

function Dashboard() {
  return (
    <div className="max-w-7xl relative mx-auto my-0">
      <DashboardNavbar />
      <Earnings />
      <MyAgents />
      <History />
    </div>
  );
}

export default Dashboard;
