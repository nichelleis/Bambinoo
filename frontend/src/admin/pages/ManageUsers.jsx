import React from 'react';

export default function ManageUsers() {
  
  const users = [
    { id: 1, name: "Dr. Sandeep", email: "sandeep@bambinoo.lk", role: "Doctor", status: "Active" },
    { id: 2, name: "Nurse Kavindi", email: "kavindi@bambinoo.lk", role: "Nurse", status: "Active" },
    { id: 3, name: "Amara Perera", email: "amara@test.com", role: "Parent", status: "Pending" },
  ];

  return (
    <div className="admin-content">
      <div className="dashboard-header">
        <h1 className="admin-title">User Management</h1>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>
          Manage account permissions for Doctors, Nurses, and Parents.
        </p>
      </div>

      <div className="stat-card" style={{ textAlign: 'left', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>NAME</th>
              <th style={{ padding: '15px' }}>EMAIL</th>
              <th style={{ padding: '15px' }}>ROLE</th>
              <th style={{ padding: '15px' }}>STATUS</th>
              <th style={{ padding: '15px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px', fontWeight: '500' }}>{user.name}</td>
                <td style={{ padding: '15px', color: '#64748b' }}>{user.email}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    background: '#e2e8f0', 
                    fontSize: '12px' 
                  }}>{user.role}</span>
                </td>
                <td style={{ padding: '15px' }}>
                  <span style={{ color: user.status === 'Active' ? '#27ae60' : '#f39c12' }}>
                    ● {user.status}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>
                  <button style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}>Edit</button>
                  <button style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}