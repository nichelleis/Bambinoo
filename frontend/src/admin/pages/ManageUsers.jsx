import React, { useState, useEffect } from 'react';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    role: 'Doctor',
    password: ''
  });

  // Get users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load user data');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Send new user data to backend
  const handleSaveUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        alert("Staff account created successfully");
        setShowModal(false);
        setFormData({ username: '', email: '', phone: '', role: 'Doctor', password: '' });
        fetchUsers();
      } else {
        alert(result.message || "Error creating user");
      }
    } catch (err) {
      alert("Connection error");
    }
  };

  // Filter users based on search bar and role dropdown
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role?.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return { background: '#ede9fe', color: '#7c3aed' };
      case 'doctor': return { background: '#dbeafe', color: '#2563eb' };
      case 'nurse': return { background: '#e0f2fe', color: '#0284c7' };
      default: return { background: '#dcfce7', color: '#16a34a' };
    }
  };

  return (
    <div className="admin-content" style={{ padding: '20px' }}>
      <div style={headerContainerStyle}>
        <div>
          <h1 style={titleStyle}>User Management</h1>
          <p style={subtitleStyle}>Manage staff accounts and system permissions.</p>
        </div>
        <button style={createBtnStyle} onClick={() => setShowModal(true)}>
          + Create Staff Account
        </button>
      </div>

      <div style={filterBarStyle}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={searchIconStyle}>🔍</span>
          <input 
            type="text" 
            placeholder="Search by username..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>
        
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="All">All Staff Roles</option>
          <option value="Admin">Admin</option>
          <option value="Doctor">Doctor</option>
          <option value="Nurse">Nurse</option>
        </select>
      </div>

      {error && <div style={errorStyle}>Error: {error}</div>}

      <div className="stat-card" style={tableCardStyle}>
        {loading ? (
          <div style={loadingPlaceholderStyle}>Loading accounts...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={headerStyle}>ID</th>
                  <th style={headerStyle}>USERNAME</th>
                  <th style={headerStyle}>EMAIL</th>
                  <th style={headerStyle}>PHONE</th>
                  <th style={headerStyle}>ROLE</th>
                  <th style={headerStyle}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan="6" style={emptyStateStyle}>No users found.</td></tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} style={tableRowStyle}>
                      <td style={cellStyle}>#{user.id}</td>
                      <td style={{ ...cellStyle, fontWeight: '600' }}>{user.username}</td>
                      <td style={cellStyle}>{user.email}</td>
                      <td style={cellStyle}>{user.phone || 'N/A'}</td>
                      <td style={cellStyle}>
                        <span style={{ ...badgeBaseStyle, ...getRoleBadgeStyle(user.role) }}>
                          {user.role?.toUpperCase() || 'USER'}
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

      {/* Popup Modal for User Creation */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ marginBottom: '20px' }}>Register New Staff</h2>
            <form onSubmit={handleSaveUser}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Username</label>
                <input required style={modalInputStyle} type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Email</label>
                <input required style={modalInputStyle} type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Password</label>
                <input required style={modalInputStyle} type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Role</label>
                <select style={modalInputStyle} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div style={modalFooterStyle}>
                <button type="submit" style={createBtnStyle}>Save Account</button>
                <button type="button" onClick={() => setShowModal(false)} style={cancelBtnStyle}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const headerContainerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' };
const titleStyle = { fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 };
const subtitleStyle = { color: '#64748b', marginTop: '5px' };
const filterBarStyle = { display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center', background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const searchInputStyle = { width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' };
const searchIconStyle = { position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#94a3b8' };
const selectStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' };
const createBtnStyle = { padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };
const cancelBtnStyle = { padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };
const tableCardStyle = { background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRowStyle = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' };
const tableRowStyle = { borderBottom: '1px solid #f1f5f9' };
const headerStyle = { padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b' };
const cellStyle = { padding: '16px', fontSize: '14px', color: '#334155' };
const badgeBaseStyle = { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' };
const actionBtnStyle = { border: 'none', background: 'transparent', color: '#3b82f6', cursor: 'pointer', fontWeight: '500', marginRight: '15px' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '12px', width: '400px' };
const formGroupStyle = { marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' };
const modalInputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' };
const modalFooterStyle = { display: 'flex', gap: '10px', marginTop: '20px' };
const labelStyle = { fontSize: '14px', fontWeight: '600', color: '#475569' };
const loadingPlaceholderStyle = { padding: '40px', textAlign: 'center', color: '#64748b' };
const emptyStateStyle = { padding: '30px', textAlign: 'center', color: '#94a3b8' };
const errorStyle = { padding: '15px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' };