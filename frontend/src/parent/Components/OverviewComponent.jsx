import style from "../../assets/styleSheets/ParentDashboard.module.css";
import { useEffect, useState } from "react";

function Overview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/header", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch(console.error);
  }, []);

  const weightCurrent = data?.growth?.weight?.current ?? 0;
  const weightPrevious = data?.growth?.weight?.previous ?? 0;
  const heightCurrent = data?.growth?.height?.current ?? 0;
  const heightPrevious = data?.growth?.height?.previous ?? 0;
  const headCurrent = data?.growth?.head?.current ?? 0;
  const headPrevious = data?.growth?.head?.previous ?? 0;

  const weightDiff = Number((weightCurrent - weightPrevious).toFixed(2));
  const heightDiff = heightCurrent - heightPrevious;
  const headDiff = headCurrent - headPrevious;

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
            <div className="fs-2 fw-bold text-primary">{weightCurrent} kg</div>
            <div className="text-muted small">Weight</div>
            <div className="text-success small">
              <i className="fas fa-arrow-up"></i> +{weightDiff} kg
            </div>
          </div>
        </div>

        <div className="col-4">
          <div
            className="stat-card p-4 rounded"
            style={{ background: "rgba(255, 107, 156, 0.2)" }}
          >
            <div className="fs-2 fw-bold text-secondary">{headCurrent} cm</div>
            <div className="text-muted small">Height</div>
            <div className="text-success small">
              <i className="fas fa-arrow-up"></i> +{heightDiff} cm
            </div>
          </div>
        </div>

        <div className="col-4">
          <div
            className="stat-card p-4 rounded"
            style={{ background: "rgba(254, 192, 99, 0.2)" }}
          >
            <div className="fs-2 fw-bold text-warning">{headCurrent} cm</div>
            <div className="text-muted small">Head Circumference</div>
            <div className="text-success small">
              <i className="fas fa-arrow-up"></i> +{headDiff} cm
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
