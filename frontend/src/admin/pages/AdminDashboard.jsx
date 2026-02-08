import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="admin-content"> 
      <div className="dashboard-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>
            Welcome to the Bambinoo health tracking system overview.
        </p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">128</p>
        </div>
        
        <div className="stat-card">
          <h3>Active Doctors</h3>
          <p className="stat-number">14</p>
        </div>
        
        <div className="stat-card">
          <h3>System Health</h3>
          <p className="stat-number" style={{ color: '#27ae60' }}>Active</p>
        </div>
      </div>
    </div>
  );
}