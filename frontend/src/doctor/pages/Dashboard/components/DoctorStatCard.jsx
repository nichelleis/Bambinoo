import "./DoctorStatCard.css";

const DoctorStatCard = ({ title, value, icon, color = "blue", onClick }) => {
  return (
    <div className="doctorstat-card" data-color={color} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick?.()}>
      <div className="doctorstat-card-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{value}</p>
      <span className="doctorstat-card-arrow">↗</span>
    </div>
  );
};

export default DoctorStatCard;