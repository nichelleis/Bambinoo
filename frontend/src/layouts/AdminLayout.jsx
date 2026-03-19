import "../assets/styleSheets/AdminLayout.css";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AdminDashboard from "../admin/pages/AdminDashboard/AdminDashboard";
import ManageUsers from "../admin/pages/ManageUsers/ManageUsers";
import EventManagement from "../admin/pages/EventManagement/EventManagement";
import Profile from "../admin/pages/Profile/Profile";
import SystemHealth from "../admin/pages/SystemHealth/SystemHealth";

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || user.role?.toLowerCase() !== "admin") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h2 className="admin-title">Admin Panel</h2>
        <nav className="admin-nav">
          <NavLink to="/admin" end className="admin-link">
            Overview
          </NavLink>
          <NavLink to="/admin/users" className="admin-link">
            User Management
          </NavLink>
          <NavLink to="/admin/user-management" className="admin-link">
            Event Management
          </NavLink>
          <NavLink to="/admin/system-health" className="admin-link">
            System Health
          </NavLink>

          <NavLink to="/admin/profile" className="admin-link">
            Profile
          </NavLink>
        </nav>
        <button onClick={handleLogout} className="admin-logout">
          Logout
        </button>
      </div>

      <div className="admin-content">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="user-management" element={<EventManagement />} />
          <Route path="system-health" element={<SystemHealth />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}
