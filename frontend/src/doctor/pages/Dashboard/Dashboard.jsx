import "./DoctorDashboard.css";
import StatCard from "./components/DoctorStatCard";
import RecentActivity from "./components/RecentActivity";
import AnalyticChart from "./components/AnalyticChart";
import DashboardHeader from "./components/DoctorDashboardHeader";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token"); 
      const res = await axios.get("http://127.0.0.1:5000/verify-token", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.valid) {
        setDoctorName(res.data.user.username);
        setRole(res.data.user.role);
      }
    } catch (error) {
      console.error("Error fetching logged-in user:", error);
    }
  };

  return (
    <div className="doctordashboard">
      <DashboardHeader doctorName={doctorName} specialization={role} />

      <div className="doctorstat-grid">
        <StatCard
          title="Quick Patient Search"
          value="Find Patient"
          icon="🔍"
          color="blue"
          onClick={() => navigate("/doctor/search")}
        />
        <StatCard
          title="Doctor Notes"
          value="Add Notes"
          icon="📝"
          color="pink"
          onClick={() => navigate("/doctor/doctornotes")}
        />
        <StatCard
          title="AI Analytics"
          value="View Insights"
          icon="🤖"
          color="purple"
          onClick={() => navigate("/doctor/ai-analytics")}
        />
        <StatCard
          title="User Authentication"
          value="Manage Access"
          icon="🔐"
          color="teal"
          onClick={() => navigate("/doctor/auth")}
        />
      </div>

      <div className="doctorbottom-grid">
        <RecentActivity />
        <AnalyticChart />
      </div>
    </div>
  );
};

export default Dashboard;
