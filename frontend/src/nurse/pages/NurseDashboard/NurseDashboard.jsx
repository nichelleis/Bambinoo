import "./NurseDashboard.css";
import StatCard from "./Components/NurseStatCards";
import RecentActivity from "./Components/NurseRecentActivity";
import AnalyticChart from "./Components/NurseAnalyticChart";
import DashboardHeader from "./Components/NurseDashboardHeader";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const NurseDashboard = () => {
  const navigate = useNavigate();
  const [nurseName, setNurseName] = useState("");
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
        setNurseName(res.data.user.username);
        setRole(res.data.user.role);
      }
    } catch (error) {
      console.error("Error fetching logged-in nurse:", error);
    }
  };

  return (
    <div className="nursedashboard">
      <DashboardHeader NurseName={nurseName} specialization={role} />

      <div className="nursestat-grid">
        <StatCard
          title="Quick Patient Search"
          value="Find Patient"
          icon="🔍"
          color="blue"
          onClick={() => navigate("/nurse/search")}
        />
        <StatCard
          title="Growth Records"
          value="Record Growth"
          icon="📏"
          color="pink"
          onClick={() => navigate("/nurse/growth")}
        />
        <StatCard
          title="Immunizations"
          value="Record Vaccine"
          icon="💉"
          color="teal"
          onClick={() => navigate("/nurse/immunizations")}
        />
        <StatCard
          title="User Authentication"
          value="Manage Access"
          icon="🔐"
          color="purple"
          onClick={() => navigate("/nurse/auth")}
        />
      </div>

      <div className="doctorbottom-grid">
        <RecentActivity />
        <AnalyticChart />
      </div>
    </div>
  );
};

export default NurseDashboard;
