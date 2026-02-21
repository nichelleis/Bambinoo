import "./StatCard.css";

const StatCard = ({ title, value, icon, color = "blue", onClick }) => {
  return (
    <div className="stat-card" data-color={color} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick?.()}>
      <div className="stat-card-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{value}</p>
      <span className="stat-card-arrow">↗</span>
    </div>
  );
};

export default StatCard;