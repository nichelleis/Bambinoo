import "../admin/components/AdminLayout.css";
// 1. Change Link to NavLink
import { Routes, Route, NavLink } from "react-router-dom"; 
import AdminDashboard from "../admin/pages/AdminDashboard"; 
import ManageUsers from "../admin/pages/ManageUsers";
import Reports from "../admin/pages/Reports"; 
import Profile from "../admin/pages/Profile";

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
          {/* 2. Change all Links to NavLinks */}
          {/* end prop ensures the Dashboard isn't always highlighted */}
          <NavLink to="/admin" end className="admin-link">Dashboard</NavLink>
          <NavLink to="/admin/users" className="admin-link">Manage Users</NavLink>
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
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}