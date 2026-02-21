import "./DashboardHeader.css";

const DashboardHeader = ({ doctorName, specialization }) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="doctor-dashboard-header">
      <div>
        <h1 className="doctor-dashboard-header-title">Welcome back, {doctorName} </h1>
        <p className="doctor-dashboard-header-subtitle">{specialization} • Doctor Dashboard • {dateStr}</p>
      </div>
      <div className="doctor-header-badge">{timeStr}</div>
    </div>
  );
};

export default DashboardHeader;
