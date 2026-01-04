import style from "../../assets/styleSheets/ParentDashboard.module.css";

function HealthNote() {
  return (
    <div className={`card ${style.dashboardCard}`}>
      <div className={style.cardHeaderCustom}>
        <div className={`mb-3 ${style.cardTitle}`}>
          <span className={`${style.cardIcon} ${style.iconRed}`}>
            <i className="bi bi-exclamation-octagon-fill"></i>
          </span>
          Quick Health Record
        </div>
      </div>
    </div>
  );
}

export default HealthNote;
