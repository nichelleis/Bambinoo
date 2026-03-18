import "../admin/components/AdminLayout.css";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react"; 
import AdminDashboard from "../admin/pages/AdminDashboard"; 
import ManageUsers from "../admin/pages/ManageUsers";
import UserManagement from "../admin/pages/UserManagement";
import Reports from "../admin/pages/Reports"; 
import Profile from "../admin/pages/Profile";
import SystemHealth from "../admin/pages/SystemHealth";

export default function AdminLayout() {
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
          <NavLink to="/admin" end className="admin-link">Overview</NavLink>
          <NavLink to="/admin/users" className="admin-link">User Managment</NavLink>
          <NavLink to="/admin/user-management" className="admin-link">Event Management</NavLink>
          <NavLink to="/admin/system-health" className="admin-link">System Health</NavLink>
          <NavLink to="/admin/reports" className="admin-link">Reports</NavLink>
          <NavLink to="/admin/profile" className="admin-link">Profile</NavLink>
        </nav>
        <button onClick={handleLogout} className="admin-logout">
          Logout
        </button>
      </div>

      <div className="admin-content">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="system-health" element={<SystemHealth />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}