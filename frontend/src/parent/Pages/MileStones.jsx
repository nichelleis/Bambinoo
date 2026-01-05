import style from "../../assets/styleSheets/ParentDashboard.module.css";

function Milestones() {
  return (
    <div className={style.milestoneContainer}>
      <div className={style.milestoneHeader}>
        <div className={style.headerContent}>
          <div className={style.headerText}>
            <h2 className={style.headerTitle}>
              <i class="bi bi-stars me-3"></i>
              Development Milestones
            </h2>
            <p className={style.headerSubtitle}>
              Track your little one's amazing journey
            </p>
          </div>
        </div>
      </div>

      <div className={`${style.ageGroupFilter} ${style.dashboardCard}`}>
        <div className={style.filterLabel}>
          <i className="bi bi-funnel me-2"></i>
          Filter by Age
        </div>
        <div className={style.ageGroupButtons}>
          <button className={style.ageBtn}>All Ags</button>
          <button className={style.ageBtn}>Birth</button>
          <button className={style.ageBtn}>1 month</button>
          <button className={style.ageBtn}>2 months</button>
          <button className={style.ageBtn}>4 months</button>
          <button className={style.ageBtn}>6 months</button>
          <button className={style.ageBtn}>7 months</button>
          <button className={style.ageBtn}>9 months</button>
          <button className={style.ageBtn}>10 months</button>
          <button className={style.ageBtn}>1 year</button>
          <button className={style.ageBtn}>15 months</button>
          <button className={style.ageBtn}> 18 months</button>
          <button className={style.ageBtn}>2years</button>
          <button className={style.ageBtn}>30 months</button>
          <button className={style.ageBtn}>3years</button>
          <button className={style.ageBtn}>4 years</button>
          <button className={style.ageBtn}>5 years</button>
        </div>
      </div>
    </div>
  );
}

export default Milestones;
