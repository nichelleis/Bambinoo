import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, activeDoctors: 0, chartData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/admin/users', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const users = await response.json();
          
          // Calculate stats
          const doctors = users.filter(u => u.role?.toLowerCase().includes('doctor')).length;
          
          const roleCounts = users.reduce((acc, user) => {
            const role = user.role || 'Unknown';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
          }, {});

          const chartData = Object.keys(roleCounts).map(key => ({
            name: key.toUpperCase(),
            value: roleCounts[key]
          }));

          setStats({
            totalUsers: users.length,
            activeDoctors: doctors,
            chartData: chartData
          });
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ['#8884d8', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

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
          <p className="stat-number">
            {loading ? "..." : stats.totalUsers}
          </p>
        </div>
        
        <div className="stat-card">
          <h3>Active Doctors</h3>
          <p className="stat-number">
            {loading ? "..." : stats.activeDoctors}
          </p>
        </div>
        
        <div className="stat-card">
          <h3>System Health</h3>
          <p className="stat-number" style={{ color: '#27ae60' }}>Active</p>
        </div>
      </div>

      <div className="stat-card" style={{ marginTop: '20px', minHeight: '400px' }}>
        <h3 style={{ marginBottom: '20px' }}>User Role Distribution</h3>
        {loading ? (
          <p>Loading Chart...</p>
        ) : (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}