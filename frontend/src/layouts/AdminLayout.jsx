import "../admin/components/AdminLayout.css";
import { Routes, Route, Link } from "react-router-dom";
import AdminDashboard from "../admin/pages/AdminDashboard"; 
import ManageUsers from "../admin/pages/ManageUsers";
import Reports from "../admin/pages/Reports"; 

export default function AdminLayout() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h2 className="admin-title">Admin Panel</h2>
        <nav className="admin-nav">
          <Link to="/admin" className="admin-link">Dashboard</Link>
          <Link to="/admin/users" className="admin-link">Manage Users</Link>
          <Link to="/admin/reports" className="admin-link">Reports</Link>
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
        </Routes>
      </div>
    </div>
  );
}