import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    adminName: "",
    totalUsers: 0,
    activeDoctors: 0,
    totalChildren: 0,
    totalEvents: 0,
    chartData: [],
    recentUsers: [],
    actionRequired: [],
    registrationData: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/admin/dashboard-stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setStats({
            adminName: data.adminName,
            totalUsers: data.totalUsers,
            activeDoctors: data.activeDoctors,
            totalChildren: data.totalChildren,
            totalEvents: data.totalEvents,
            chartData: data.chartData,
            recentUsers: data.recentUsers,
            actionRequired: data.actionRequired,
            registrationData: data.registrationData,
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

  const COLORS = ["#8884d8", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  return (
    <div className="admin-content" style={{ padding: "20px" }}>
      <div className="dashboard-header">
        <p
          style={{ color: "#64748b", marginBottom: "30px", fontSize: "1.5rem" }}
        >
          Welcome back,{" "}
          <span style={{ fontWeight: "bold", color: "#0f172a" }}>
            {stats.adminName || "Admin"}
          </span>
        </p>
      </div>

      <div
        className="stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div className="stat-card-admin" style={cardStyle}>
          <h3 style={cardTitleStyle}>Total Users</h3>
          <p className="stat-number" style={numberStyle}>
            {loading ? "..." : stats.totalUsers}
          </p>
        </div>

        <div className="stat-card0admin" style={cardStyle}>
          <h3 style={cardTitleStyle}>Active Doctors</h3>
          <p className="stat-number" style={numberStyle}>
            {loading ? "..." : stats.activeDoctors}
          </p>
        </div>

        <div className="stat-card-admin" style={cardStyle}>
          <h3 style={cardTitleStyle}>Children Enrolled</h3>
          <p className="stat-number" style={numberStyle}>
            {loading ? "..." : stats.totalChildren}
          </p>
        </div>

        <div className="stat-card-admin" style={cardStyle}>
          <h3 style={cardTitleStyle}>Active Events</h3>
          <p
            className="stat-number"
            style={{ ...numberStyle, color: "#3b82f6" }}
          >
            {loading ? "..." : stats.totalEvents}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          className="stat-card-admin"
          style={{ ...cardStyle, minHeight: "350px" }}
        >
          <h3
            style={{
              marginBottom: "20px",
              color: "#64748b",
              fontSize: "14px",
              textTransform: "uppercase",
            }}
          >
            User Role Distribution
          </h3>
          {loading ? (
            <p>Loading Chart...</p>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div
          className="stat-card-admin"
          style={{
            ...cardStyle,
            minHeight: "350px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              marginBottom: "20px",
              color: "#64748b",
              fontSize: "14px",
              textTransform: "uppercase",
            }}
          >
            User Registrations (Monthly)
          </h3>
          {loading ? (
            <p>Loading Chart...</p>
          ) : (
            <div style={{ width: "100%", flexGrow: 1, minHeight: "250px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.registrationData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#bedbe5",
                      borderRadius: "8px",
                      border: "none",
                      color: "#f8fafc",
                    }}
                    itemStyle={{ color: "#14b8a6", fontWeight: "bold" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    activeDot={{
                      r: 6,
                      fill: "#14b8a6",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        <div className="stat-card-admin" style={cardStyle}>
          <h3
            style={{
              marginBottom: "20px",
              color: "#64748b",
              fontSize: "14px",
              textTransform: "uppercase",
            }}
          >
            Recently Registered
          </h3>
          {loading ? (
            <p>Loading recent users...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid #e2e8f0",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    <th style={{ padding: "12px 8px" }}>Username</th>
                    <th style={{ padding: "12px 8px" }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((user) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "14px",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 8px",
                          fontWeight: "500",
                          color: "#0f172a",
                        }}
                      >
                        {user.username}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span
                          style={{
                            background: "#f1f5f9",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            textTransform: "capitalize",
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats.recentUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan="2"
                        style={{
                          padding: "12px 8px",
                          textAlign: "center",
                          color: "#94a3b8",
                        }}
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          className="stat-card-admin"
          style={{ ...cardStyle, borderTop: "4px solid #f59e0b" }}
        >
          <h3
            style={{
              marginBottom: "20px",
              color: "#d97706",
              fontSize: "14px",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ⚠️ Action Required: Missing Data
          </h3>
          {loading ? (
            <p>Scanning compliance...</p>
          ) : stats.actionRequired.length === 0 ? (
            <p
              style={{ color: "#10b981", fontSize: "14px", fontWeight: "500" }}
            >
              ✅ All staff profiles are 100% complete.
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {stats.actionRequired.map((user) => (
                <div
                  key={user.id}
                  style={{
                    padding: "12px",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontWeight: "600", color: "#92400e" }}>
                      {user.username}
                    </span>
                    <span
                      style={{ color: "#b45309", textTransform: "capitalize" }}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div style={{ color: "#d97706" }}>
                    Missing:{" "}
                    <span style={{ fontWeight: "500" }}>{user.missing}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: "24px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};
const cardTitleStyle = {
  fontSize: "13px",
  color: "#64748b",
  marginBottom: "8px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};
const numberStyle = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#0f172a",
  margin: 0,
};
