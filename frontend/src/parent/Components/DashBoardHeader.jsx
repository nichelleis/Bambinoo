import style from "../../assets/styleSheets/ParentDashboard.module.css";

function DashboardHeader() {
  return (
    <header className={style.dashboardHeader}>
      <div className={style.headerContent}>
        <div className={style.childInfoSection}>
          <div className={style.childIcon}>
            {/* change to show the pic the parent adds later from the profile section and maybe add like a default icon to show if a image int added */}
          </div>
          <div className={style.childInfo}>
            <h1 className={style.childName}>Thinal Fernando</h1>
            <div className={style.childAge}>10 months 12 days</div>
          </div>
        </div>
        <div className={style.headerActionsSection}>
          <button className={style.headerIcon}>
            <i className="bi bi-bell"></i>
          </button>
          <button className={style.headerIcon}>
            <i className="bi bi-person"></i>
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
