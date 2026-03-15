import { NavLink, useNavigate } from "react-router-dom";
import "./NurseSideNavigation.css";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <aside className="sidebar">
      <h2 className="logo">Nurse Portal</h2>

      <div className="menu-section">
        <p className="sidesection-title">MAIN</p>
        <NavLink to="/nurse/dashboard">Overview</NavLink>
        <NavLink to="/nurse/search">Search Child</NavLink>
      </div>

      <div className="menu-section">
        <p className="sidesection-title">PATIENT DATA</p>
        <NavLink to="/nurse/chdr">CHDR View</NavLink>
        <NavLink to="/nurse/growth">Growth Data</NavLink>
        <NavLink to="/nurse/immunizations">Immunizations</NavLink>
      </div>

      <div className="menu-section">
        <p className="sidesection-title">COMMUNICATION</p>
        <NavLink to="/nurse/messaging">Messaging</NavLink>
      </div>

      <div className="menu-section">
        <p className="sidesection-title">ANALYTICS</p>
        <NavLink to="/nurse/ai-analytics">AI Analytics</NavLink>
      </div>
      <div className="menu-section">
        <p className="sidesection-title">AUTHENTICATION</p>
        <NavLink to="/nurse/auth">Authentication</NavLink>
      </div>

      <div className="menu-section logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
