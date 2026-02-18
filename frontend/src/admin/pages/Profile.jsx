import React, { useState, useEffect } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        // We fetch the latest data from the backend to ensure email shows up
        const response = await fetch("http://127.0.0.1:5000/verify-token", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok && data.user) {
          setUser(data.user);
          // Update localStorage so it's correct next time
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="admin-content">Loading...</div>;
  if (!user) return <div className="admin-content">User not found.</div>;

  return (
    <div className="admin-content">
      <div className="dashboard-header">
        <h1 className="admin-title">Account Settings</h1>
      </div>

      <div className="stat-card" style={{ maxWidth: "600px", margin: "20px 0", textAlign: "center" }}>
        <div style={{ 
          width: "80px", height: "80px", background: "linear-gradient(135deg, #6366f1, #a855f7)", 
          borderRadius: "50%", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2rem", color: "white", fontWeight: "bold"
        }}>
          {user.username?.charAt(0).toUpperCase()}
        </div>
        
        <h2 style={{ color: "#0f172a", marginBottom: "8px" }}>{user.username}</h2>
        <p style={{ color: "#64748b", fontSize: "1rem", marginBottom: "4px" }}>
          <strong>Email:</strong> {user.email || "No email set"}
        </p>
        <p style={{ color: "#64748b", fontSize: "1rem" }}>
          <strong>Role:</strong> <span className="role-badge admin">{user.role}</span>
        </p>
      </div>
    </div>
  );
}