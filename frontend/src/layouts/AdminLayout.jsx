import { Outlet, Link } from "react-router-dom";

export default function AdminLayout() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.title}>Admin Panel</h2>

        <nav style={styles.nav}>
          <Link to="/admin" style={styles.link}>Dashboard</Link>
          <Link to="/admin/users" style={styles.link}>Manage Users</Link>
          <Link to="/admin/reports" style={styles.link}>Reports</Link>
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      <div style={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
  },
  sidebar: {
    width: "220px",
    background: "#1e293b",
    color: "#fff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    marginBottom: "20px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "15px",
  },
  logoutBtn: {
    marginTop: "auto",
    padding: "8px",
    background: "crimson",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  content: {
    flex: 1,
    padding: "30px",
    background: "#f1f5f9",
  },
};
