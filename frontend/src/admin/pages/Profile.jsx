import React, { useState, useEffect } from 'react';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  if (!user) return <div className="admin-content">Loading profile...</div>;

  return (
    <div className="admin-content">
      <div className="dashboard-header">
        <h1 className="admin-title">Account Settings</h1>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>
          Manage your personal information and security preferences.
        </p>
      </div>

      <div className="stat-card" style={{ maxWidth: '600px', padding: '40px', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontSize: '32px',
            fontWeight: 'bold',
            marginRight: '20px',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
          }}>
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#1e293b' }}>{user.username}</h2>
            <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>System {user.role}</p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', marginBottom: '30px' }} />

        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Email Address</label>
            <div style={infoBoxStyle}>{user.email || 'N/A'}</div>
          </div>

          <div>
            <label style={labelStyle}>Access Level</label>
            <div style={infoBoxStyle}>{user.role}</div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button style={{ 
              padding: '12px 24px', 
              background: 'white', 
              border: '1px solid #cbd5e1', 
              borderRadius: '8px',
              color: '#334155',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '700',
  color: '#94a3b8',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const infoBoxStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  color: '#334155',
  fontSize: '15px'
};