import "./DoctorDashboard.css";
import StatCard from "./components/DoctorStatCard";
import RecentActivity from "./components/RecentActivity";
import AnalyticChart from "./components/AnalyticChart";
import DashboardHeader from "./components/DoctorDashboardHeader";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { title: "Total Patients", value: "1,284", icon: "👶", trend: "+12%" },
    { title: "Today's Visits", value: "24", icon: "📋", trend: "+3" },
    { title: "Pending Reports", value: "7", icon: "📊", trend: "-2" },
    { title: "Avg Growth Score", value: "94.2", icon: "📈", trend: "+1.4%" },
  ];

  return (
    <div className="doctordashboard">
      <DashboardHeader
        doctorName="Dr. Sarah Mitchell"
        specialization="Pediatric Specialist"
      />

      <div className="doctormini-stats-row">
        {stats.map((s, i) => (
          <div className="mini-stat" key={i}>
            <span className="mini-icon">{s.icon}</span>
            <div>
              <p className="mini-label">{s.title}</p>
              <div className="mini-value-row">
                <span className="mini-value">{s.value}</span>
                <span className="mini-trend">{s.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="doctorstat-grid">
        <StatCard title="Quick Patient Search" value="Find Patient" icon="🔍" color="blue" onClick={() => navigate("/doctor/search")} />
        <StatCard title="Doctor Notes" value="Add Notes" icon="📝" color="pink" onClick={() => navigate("/doctor/doctor-notes")} />
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