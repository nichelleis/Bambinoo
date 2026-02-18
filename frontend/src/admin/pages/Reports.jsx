import React, { useState } from 'react';

export default function Reports() {
  const [loading, setLoading] = useState(false);

   
  const handleDownloadUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      //  Fetch real user data from your backend
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Failed to fetch data");
      
      const users = await response.json();

      
      const headers = ['ID,Username,Email,Role,Phone'];
      const rows = users.map(u => 
        `${u.id},${u.username},${u.email},${u.role},${u.phone || 'N/A'}`
      );
      const csvContent = [headers, ...rows].join('\n');

      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bambinoo_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (error) {
      console.error("Download failed:", error);
      alert("Error downloading report. Are you logged in?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-content">
      <div className="dashboard-header">
        <h1 className="admin-title">System Reports</h1>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>
          Analyze system performance and export data for external review.
        </p>
      </div>

      {/* SECTION 1: Visual Stats  */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>New Registrations</h3>
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

      {/*SECTION 2: ACTIONS */}
      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Export Data Cards */}
        <div className="stat-card" style={{ padding: '25px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>📥 Export User Data</h3>
          <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>
            Download a complete list of Doctors, Nurses, and Parents as a .CSV file (Excel compatible).
          </p>
          <button 
            onClick={handleDownloadUsers}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Generating File...' : 'Download CSV Report'}
          </button>
        </div>

        {/* Print Summary Card */}
        <div className="stat-card" style={{ padding: '25px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>🖨️ Print Summary</h3>
          <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>
            Generate a printer-friendly PDF version of this dashboard for physical filing.
          </p>
          <button 
            onClick={() => window.print()}
            style={{
              width: '100%',
              padding: '12px',
              background: 'white',
              border: '2px solid #cbd5e1',
              color: '#334155',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
          >
            Print to PDF
          </button>
        </div>

      </div>
    </div>
  );
}