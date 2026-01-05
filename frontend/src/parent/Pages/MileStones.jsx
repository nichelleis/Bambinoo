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
    </div>
  );
}

export default Milestones;
