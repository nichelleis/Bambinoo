import "../../../../assets/styleSheets/DashboardHeader.module.css";

const DashboardHeader = ({ doctorName, specialization }) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="dashboard-header">
      <div>
        <h1 className="dashboard-header-title">Welcome back, {doctorName} </h1>
        <p className="dashboard-header-subtitle">{specialization} • Doctor Dashboard • {dateStr}</p>
      </div>
      <div className="header-badge">On Duty · {timeStr}</div>
    </div>
  );
};

export default DashboardHeader;
