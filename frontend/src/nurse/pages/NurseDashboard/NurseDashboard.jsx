import "./NurseDashboard.css";
import StatCard from "./Components/NurseStatCards";
import RecentActivity from "./Components/NurseRecentActivity";
import AnalyticChart from "./Components/NurseAnalyticChart";
import DashboardHeader from "./Components/NurseDashboardHeader";
import { useNavigate } from "react-router-dom";

const NurseDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="nursedashboard">
      <DashboardHeader NurseName="Nurse" />

      <div className="nursestat-grid">
        <StatCard title="Quick Patient Search" value="Find Patient" icon="🔍" color="blue" onClick={() => navigate("/nurse/search")} />
        <StatCard title="Growth Records" value="Record Growth" icon="📏" color="pink" onClick={() => navigate("/nurse/growth")} />
        <StatCard title="Immunizations" value="Record Vaccine" icon="💉" color="teal" onClick={() => navigate("/nurse/immunizations")} />
          <StatCard title="User Authentication" value="Manage Access" icon="🔐" color="purple" onClick={() => navigate("/nurse/auth")} />

      </div>

      <div className="doctorbottom-grid">
        <RecentActivity />
        <AnalyticChart />
      </div>
    </div>
  );
};

export default NurseDashboard;