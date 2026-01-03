import style from "../../assets/styleSheets/ParentDashboard.module.css";

function DevelopmentMilestonesCard() {
  return (
    <div className={`card ${style.dashboardCard}`}>
      <div className={style.cardHeaderCustom}>
        <div className={`mb-3 ${style.cardTitle}`}>
          <span className={`${style.cardIcon} ${style.iconYellow}`}>
            <i className="bi bi-star"></i>
          </span>
          Development Milestones
        </div>
      </div>
      <br />

      <button className="btn btn-outline-primary w-100 mt-2">
        View Detailed Milestones <i className="bi bi-arrow-right"></i>
      </button>
    </div>
  );
}

export default DevelopmentMilestonesCard;
