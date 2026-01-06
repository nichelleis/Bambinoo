import "./StatCard.css";

const StatCard = ({ title, value, onClick }) => {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
  );
};

export default StatCard;
