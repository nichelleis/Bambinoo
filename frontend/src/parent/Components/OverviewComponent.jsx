import style from "../../assets/styleSheets/ParentDashboard.module.css";

function Overview() {
  return (
    <div className={`card ${style.dashboardCard}`}>
      <div
        className={`${style.cardHeaderCustom} d-flex justify-content-between align-items-center`}
      >
        <div className={style.cardTitle}>
          <span className={`${style.cardIcon} ${style.iconGreen}`}>
            <i className="bi bi-bar-chart-line-fill"></i>
          </span>
          Growth Overview
        </div>
        <button className="btn btn-sm text-primary">
          View Details <i className="bi bi-arrow-right"></i>
        </button>
      </div>

      <div className="row card-body text-center mb-1">
        <div className="col-4">
          <div
            className="stat-card p-4 rounded"
            style={{ background: "rgba(107, 99, 255, 0.2)" }}
          >
            <div className="fs-2 fw-bold text-primary"> kg</div>
            <div className="text-muted small">Weight</div>
            <div className="text-success small">
              <i className="fas fa-arrow-up"></i> + kg
            </div>
          </div>
        </div>

        <div className="col-4">
          <div
            className="stat-card p-4 rounded"
            style={{ background: "rgba(255, 107, 156, 0.2)" }}
          >
            <div className="fs-2 fw-bold text-secondary">cm</div>
            <div className="text-muted small">Height</div>
            <div className="text-success small">
              <i className="fas fa-arrow-up"></i> +cm
            </div>
          </div>
        </div>

        <div className="col-4">
          <div
            className="stat-card p-4 rounded"
            style={{ background: "rgba(254, 192, 99, 0.2)" }}
          >
            <div className="fs-2 fw-bold text-warning">cm</div>
            <div className="text-muted small">Head Circumference</div>
            <div className="text-success small">
              <i className="fas fa-arrow-up"></i> + cm
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
