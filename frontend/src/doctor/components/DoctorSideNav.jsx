import { NavLink, useNavigate } from "react-router-dom";
import "./DoctorSideNav.css";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <aside className="sidebar">
      <h2 className="logo">Doctor Portal</h2>

      <div className="menu-section">
        <p className="sidesection-title">MAIN</p>
        <NavLink to="/doctor/dashboard">Overview</NavLink>
        <NavLink to="/doctor/search">Search Child</NavLink>
      </div>

      <div className="menu-section">
        <p className="sidesection-title">PATIENT DATA</p>
        <NavLink to="/doctor/chdr">CHDR View</NavLink>
        <NavLink to="/doctor/growth">Growth Data</NavLink>
        <NavLink to="/doctor/immunizations">Immunizations</NavLink>
        <NavLink to="/doctor/doctornotes">Doctor Notes</NavLink> 
      </div>
      
      <div className="menu-section">
        <p className="sidesection-title">COMMUNICATION</p>
        <NavLink to="/doctor/messaging">Messaging</NavLink>
      </div>

      <div className="menu-section">
        <p className="sidesection-title">ANALYTICS</p>
        <NavLink to="/doctor/ai-analytics">AI Analytics</NavLink>
      </div>
      <div className="menu-section">
        <p className="sidesection-title">AUTHENTICATION</p>
        <NavLink to="/doctor/auth">User Authentication</NavLink>
      </div>
      <div className="menu-section">
        <p className="sidesection-title">Settings</p>
        <NavLink to="/doctor/doctorprofile">Doctor Profile</NavLink>
      </div>
      

      <div className="menu-section logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}