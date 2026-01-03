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
      <div className="milestone-category mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span>
            <i
              className="bi bi-person-arms-up"
              style={{ color: "var(--primary)", marginRight: 8 }}
            ></i>
            <strong>Physical</strong>
          </span>
          <span style={{ color: "var(--success)", fontWeight: 600 }}>2/3</span>
        </div>

        <div className="progress" style={{ height: 8, borderRadius: 10 }}>
          <div
            className="progress-bar"
            style={{
              width: `50%`,
              background: "var(--primary)",
            }}
          ></div>
        </div>

        <div
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 5,
          }}
        >
          Hold you arms up
        </div>
      </div>

      <button className="btn btn-outline-primary w-100 mt-2">
        View Detailed Milestones <i className="bi bi-arrow-right"></i>
      </button>
    </div>
  );
}

export default DevelopmentMilestonesCard;
