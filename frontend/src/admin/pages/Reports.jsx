import React from 'react';

export default function Reports() {
  return (
    <div className="admin-content">
      <div className="dashboard-header">
        <h1 className="admin-title">System Reports</h1>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>
          Analyze system performance and user growth statistics.
        </p>
      </div>

      {}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>New Registrations (This Month)</h3>
          <p className="stat-number" style={{ color: '#3b82f6' }}>+24</p>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '10px' }}>
            ↑ 12% from last month
          </p>
        </div>

        <div className="stat-card">
          <h3>Critical Health Alerts</h3>
          <p className="stat-number" style={{ color: '#ef4444' }}>3</p>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '10px' }}>
            Requires immediate attention
          </p>
        </div>

        <div className="stat-card">
          <h3>System Uptime</h3>
          <p className="stat-number" style={{ color: '#27ae60' }}>99.8%</p>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '10px' }}>
            Server status: Healthy
          </p>
        </div>
      </div>

      {}
      <div style={{ marginTop: '30px', background: 'white', padding: '25px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ color: '#64748b', marginBottom: '15px' }}>USER GROWTH OVERVIEW</h3>
        <div style={{ height: '200px', background: '#f8fafc', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          [Chart Component Will Go Here]
        </div>
      </div>
    </div>
  );
}