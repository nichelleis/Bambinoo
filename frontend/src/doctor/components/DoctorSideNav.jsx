import { NavLink } from "react-router-dom";
import "./DoctorSideNav.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="logo">Doctor Portal</h2>

      <div className="menu-section">
        <p className="section-title">MAIN</p>
        <NavLink to="/doctor" end data-icon="🏠">
          Overview
        </NavLink>
        <NavLink to="/doctor/search" data-icon="🔍">
          Search Child
        </NavLink>
      </div>

      <div className="menu-section">
        <p className="section-title">PATIENT DATA</p>
        <NavLink to="/doctor/chdr" data-icon="📄">
          CHDR View
        </NavLink>
        <NavLink to="/doctor/growth" data-icon="📈">
          Growth Data
        </NavLink>
        <NavLink to="/doctor/immunizations" data-icon="💉">
          Immunizations
        </NavLink>
        <NavLink to="/doctor/medicalhistory" data-icon="🩺">
          Medical History
        </NavLink>
        <NavLink to="/doctor/development" data-icon="🧠">
          Development
        </NavLink>
        <NavLink to="/doctor/medicines" data-icon="💊">
          Medicines
        </NavLink>
      </div>

      <div className="menu-section">
        <p className="section-title">COMMUNICATION</p>
        <NavLink to="/doctor/doctor-notes" data-icon="📝">
          Doctor Notes
        </NavLink>
        <NavLink to="/doctor/messaging" data-icon="💬">
          Messaging
        </NavLink>
      </div>

      <div className="menu-section">
        <p className="section-title">ANALYTICS</p>
        <NavLink to="/doctor/ai-analytics" data-icon="📊">
          AI Analytics
        </NavLink>
      </div>

      <div className="menu-section">
        <p className="section-title">ADMISSION</p>
        <NavLink to="/doctor/auth" data-icon="🔐">
          User Auth
        </NavLink>
      </div>
    </aside>
  );
}
