import { NavLink } from "react-router-dom";
import styles from "../../assets/styleSheets/DoctorDashboard.module.css";

function DoctorSideNav() {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.logo}>Doctor Portal</h2>

      <nav className={styles.sidebarContent}>
        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>MAIN</p>

          <NavLink end to="" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            Overview
          </NavLink>

          <NavLink to="search" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            Search Child
          </NavLink>
        </div>

        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>PATIENT DATA</p>

          <NavLink to="chdr" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            CHDR View
          </NavLink>

          <NavLink to="growth" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            Growth Data
          </NavLink>

          <NavLink to="immunizations" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            Immunizations
          </NavLink>

          <NavLink to="medicalhistory" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            Medical History
          </NavLink>

          <NavLink to="development" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            Development
          </NavLink>

          <NavLink to="medicines" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            Medicines
          </NavLink>
        </div>

        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>COMMUNICATION</p>

          <NavLink to="doctor-notes" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            Doctor Notes
          </NavLink>

          <NavLink to="messaging" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            Messaging
          </NavLink>
        </div>

        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>ANALYTICS</p>

          <NavLink to="ai-analytics" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            AI Analytics
          </NavLink>
        </div>

        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>ADMISSION</p>

          <NavLink to="auth" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            User Auth
          </NavLink>
        </div>
      </nav>

      <button
        className={styles.logout}
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </aside>
  );
}

export default DoctorSideNav;
