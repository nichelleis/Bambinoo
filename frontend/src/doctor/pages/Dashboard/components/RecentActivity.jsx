import { useEffect, useState } from "react";
import "./RecentActivity.css";

const CATEGORY_CONFIG = {
  growth:      { icon: "📏", color: "#3b82f6", bg: "#e8f4fd" },
  vaccination: { icon: "💉", color: "#10b981", bg: "#e8fdf5" },
  prescription:{ icon: "💊", color: "#f59e0b", bg: "#fef3e2" },
  note:        { icon: "📝", color: "#8b5cf6", bg: "#f3e8fd" },
  visit:       { icon: "🏥", color: "#ef4444", bg: "#fde8e8" },
};

function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(isoString).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/doctor-recent-activity")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setActivities(data);
        else setError("Failed to load activity.");
      })
      .catch(() => setError("Cannot reach server."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="activity-card">
      <div className="activity-header">
        <h4>Recent Activity</h4>
        <span className="activity-count">{activities.length} records</span>
      </div>

      {loading && (
        <div className="activity-loading">
          <div className="activity-spinner"></div>
          <p>Loading activity...</p>
        </div>
      )}

      {error && <p className="activity-muted">{error}</p>}

      {!loading && !error && activities.length === 0 && (
        <p className="activity-muted">No recent activity found.</p>
      )}

      <ul className="activity-list">
        {activities.map((item, i) => {
          const config = CATEGORY_CONFIG[item.category] || { icon: "📌", color: "#aaa", bg: "#f5f5f5" };
          return (
            <li key={i} className="activity-item">
              <div className="activity-icon" style={{ background: config.bg, color: config.color }}>
                {config.icon}
              </div>
              <div className="activity-body">
                <div className="activity-top">
                  <span className="activity-type" style={{ color: config.color }}>{item.type}</span>
                  <span className="activity-time">{timeAgo(item.timestamp)}</span>
                </div>
                <p className="activity-patient">👤 {item.patient}</p>
                <p className="activity-detail">{item.detail}</p>
                <p className="activity-by">— {item.recorded_by}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentActivity;