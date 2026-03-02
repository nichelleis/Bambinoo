import "./NurseDashboardHeader.css";

const NurseDashboardHeader = ({ NurseName }) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="nurse-dashboard-header">
      <div>
        <h1 className="nurse-dashboard-header-title">Welcome back, {NurseName}</h1>
        <p className="nurse-dashboard-header-subtitle">Nurse Dashboard • {dateStr}</p>
      </div>
      <div className="nurse-header-badge">{timeStr}</div>
    </div>
  );
};

export default NurseDashboardHeader;
