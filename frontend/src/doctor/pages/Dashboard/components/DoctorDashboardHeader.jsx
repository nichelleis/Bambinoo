import "../../../../assets/styleSheets/DashboardHeader.module.css";

const DashboardHeader = ({ doctorName, specialization }) => {
  return (
    <div className="dashboard-header">
      <div>
        <h1 className="dashboard-header-title">
          Welcome back, {doctorName}
        </h1>
        <p className="dashboard-header-subtitle">
          {specialization} • Doctor Dashboard
        </p>
      </div>

      
    </div>
  );
};

export default DashboardHeader;
