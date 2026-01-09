import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="logo">Doctor Portal</h2>

      <div className="menu-section">
        <p className="section-title">MAIN</p>
        <NavLink to="/">Overview</NavLink>
        <NavLink to="/search">Search Child</NavLink>
      </div>

      <div className="menu-section">
        <p className="section-title">PATIENT DATA</p>
        <NavLink to="/chdr">CHDR View</NavLink>
        <NavLink to="/growth">Growth Data</NavLink>
        <NavLink to="/immunizations">Immunizations</NavLink>
        <NavLink to="/medicalhistory">Medical History</NavLink>
        <NavLink to="/development">Development</NavLink>
        <NavLink to="/medicines">Medicines</NavLink>
      </div>

      <div className="menu-section">
        <p className="section-title">COMMUNICATION</p>
        <NavLink to="/doctor-notes">Doctor Notes</NavLink>
        <NavLink to="/messaging">Messaging</NavLink>
      </div>

      <div className="menu-section">
        <p className="section-title">ANALYTICS</p>
        <NavLink to="/ai-analytics">AI Analytics</NavLink>
      </div>

      <div className="menu-section">
        <p className="section-title">ADMISSION</p>
        <NavLink to="/auth">User Auth</NavLink>
      </div>
    </aside>
  );
}
