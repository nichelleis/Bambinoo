import "./DoctorDashboard.css";
import StatCard from "./components/DoctorStatCard";
import RecentActivity from "./components/RecentActivity";
import AnalyticChart from "./components/AnalyticChart";
import DashboardHeader from "./components/DoctorDashboardHeader";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="doctordashboard">
      <DashboardHeader doctorName="Dr. Sarah Mitchell" />

      <div className="doctorstat-grid">
        <StatCard title="Quick Patient Search" value="Find Patient" icon="🔍" color="blue" onClick={() => navigate("/doctor/search")} />
        <StatCard title="Doctor Notes" value="Add Notes" icon="📝" color="pink" onClick={() => navigate("/doctor/doctornotes")} />
        <StatCard title="AI Analytics" value="View Insights" icon="🤖" color="purple" onClick={() => navigate("/doctor/ai-analytics")} />
        <StatCard title="User Authentication" value="Manage Access" icon="🔐" color="teal" onClick={() => navigate("/doctor/auth")} />
      </div>

      <div className="doctorbottom-grid">
        <RecentActivity />
        <AnalyticChart />
      </div>
    </div>
  );
};

export default Dashboard;