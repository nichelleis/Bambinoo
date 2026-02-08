import "./Dashboard.css";
import StatCard from "./components/StatCard";
import RecentActivity from "./components/RecentActivity";
import AnalyticChart from "./components/AnalyticChart";
import DashboardHeader from "./components/DoctorDashboardHeader";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
     
      <DashboardHeader
        doctorName="Dr. Sarah Mitchell"
        specialization="Pediatric Specialist"
      />

    
      <div className="stat-grid">
        <StatCard
          title="Quick Patient Search"
          value="Find Patient"
          onClick={() => navigate("/doctor/search")}
        />

        <StatCard
          title="Doctor Notes"
          value="Add Notes"
          onClick={() => navigate("/doctor/doctor-notes")}
        />

        <StatCard
          title="AI Analytics"
          value="View Insights"
          onClick={() => navigate("/doctor/ai-analytics")}
        />

        <StatCard
          title="User Authentication"
          value="Manage Access"
          onClick={() => navigate("/doctor/auth")}
        />
      </div>

      
      <div className="middle-grid">
        <RecentActivity />
      </div>

    
      <div className="chart-section">
        <AnalyticChart />
      </div>
    </div>
  );
};

export default Dashboard;
