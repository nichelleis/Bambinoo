import { NavLink } from "react-router-dom";
import "./DoctorSideNav.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="logo">Doctor Portal</h2>

      <div className="menu-section">
        <p className="section-title">MAIN</p>
        <NavLink to="/doctor" >
          Overview
        </NavLink>
        <NavLink to="/doctor/search" >
          Search Child
        </NavLink>
      </div>

      <div className="menu-section">
        <p className="section-title">PATIENT DATA</p>
        <NavLink to="/doctor/chdr" >
          CHDR View
        </NavLink>
        <NavLink to="/doctor/growth" >
          Growth Data
        </NavLink>
        <NavLink to="/doctor/immunizations" >
          Immunizations
        </NavLink>
        <NavLink to="/doctor/medicalhistory" >
          Medical History
        </NavLink>
        <NavLink to="/doctor/doctornotes" >
          Doctor Notes
        </NavLink>
        <NavLink to="/doctor/medicines" >
          Medicines
        </NavLink>
      </div>

      <div className="menu-section">
        <p className="section-title">COMMUNICATION</p>
        <NavLink to="/doctor/doctor-notes" >
          Doctor Notes
        </NavLink>
        <NavLink to="/doctor/messaging" >
          Messaging
        </NavLink>
      </div>

      <div className="menu-section">
        <p className="section-title">ANALYTICS</p>
        <NavLink to="/doctor/ai-analytics" >
          AI Analytics
        </NavLink>
      </div>

      <div className="menu-section">
        <p className="section-title">ADMISSION</p>
        <NavLink to="/doctor/auth" >
          User Auth
        </NavLink>
      </div>
    </aside>
  );
}
