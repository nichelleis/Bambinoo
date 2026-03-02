import "./NurseStatCards.css";

const NurseStatCard = ({ title, value, icon, color = "blue", onClick }) => {
  return (
    <div className="nursestat-card" data-color={color} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick?.()}>
      <div className="nursestat-card-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{value}</p>
      <span className="nursestat-card-arrow">↗</span>
    </div>
  );
};

export default NurseStatCard;