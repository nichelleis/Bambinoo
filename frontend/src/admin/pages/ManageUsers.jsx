import React, { useState, useEffect } from 'react';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from the Flask Backend on load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("No authentication token found. Please login.");
        }

        const response = await fetch('http://localhost:5000/api/admin/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Helper to color-code roles
  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return { background: '#ede9fe', color: '#7c3aed' }; // Purple
      case 'doctor': return { background: '#dbeafe', color: '#2563eb' }; // Blue
      case 'nurse': return { background: '#e0f2fe', color: '#0284c7' }; // Light Blue
      default: return { background: '#dcfce7', color: '#16a34a' };      // Green (Parent)
    }
  };

  return (
    <div className="admin-content" style={{ padding: '20px' }}>
      <div className="dashboard-header">
        <h1 className="admin-title" style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
          User Management
        </h1>
        <p style={{ color: '#64748b', marginBottom: '30px', marginTop: '5px' }}>
          Manage account permissions for Doctors, Nurses, and Parents.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div style={{ padding: '15px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>
          ⚠️ Error: {error}
        </div>
      )}

      {/* Main Table Card */}
      <div className="stat-card" style={{ 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        overflow: 'hidden' 
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading user data...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={headerStyle}>ID</th>
                  <th style={headerStyle}>USERNAME</th>
                  <th style={headerStyle}>EMAIL</th>
                  <th style={headerStyle}>PHONE</th>
                  <th style={headerStyle}>ROLE</th>
                  <th style={headerStyle}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                      No users found in the database.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                      <td style={cellStyle}>#{user.id}</td>
                      <td style={{ ...cellStyle, fontWeight: '600', color: '#334155' }}>{user.username}</td>
                      <td style={{ ...cellStyle, color: '#64748b' }}>{user.email}</td>
                      <td style={{ ...cellStyle, color: '#64748b' }}>{user.phone || 'N/A'}</td>
                      <td style={cellStyle}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          ...getRoleBadgeStyle(user.role)
                        }}>
                          {user.role ? user.role.toUpperCase() : 'USER'}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <button style={actionBtnStyle}>Edit</button>
                        <button style={{ ...actionBtnStyle, color: '#ef4444' }}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Consistent Styles
const headerStyle = {
  padding: '16px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  letterSpacing: '0.5px'
};

const cellStyle = {
  padding: '16px',
  fontSize: '14px'
};

const actionBtnStyle = {
  border: 'none',
  background: 'transparent',
  color: '#3b82f6',
  cursor: 'pointer',
  fontWeight: '500',
  marginRight: '15px',
  padding: '0'
};