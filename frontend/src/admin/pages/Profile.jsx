import React, { useState, useEffect } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchAdmin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/admin-profile");
      const data = await response.json();

      if (response.ok && data.username) {
        setUser(data);
      } else {
        console.error("Admin not found:", data);
      }
    } catch (err) {
      console.error("Admin fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchAdmin();
}, []);

  if (loading) return <div className="admin-content">Loading...</div>;
  if (!user) return <div className="admin-content">User not found.</div>;

  return (
    <div className="admin-content">
      <h1 className="admin-title">Account Settings</h1>

      <div className="stat-card profile-container">
        <div className="profile-left">
          <div className="profile-initial">
            {user.username?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-right">
          <div className="profile-row">
            <label>Username</label>
            <div>{user.username}</div>
          </div>

          <div className="profile-row">
            <label>Email</label>
            <div>{user.email || "Not provided"}</div>
          </div>

          <div className="profile-row">
            <label>Role</label>
            <div className="profile-role">{user.role}</div>
          </div>

          
        </div>
      </div>
    </div>
  );
}