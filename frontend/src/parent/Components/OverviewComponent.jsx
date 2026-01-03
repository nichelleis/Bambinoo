import style from "../../assets/styleSheets/ParentDashboard.module.css";
import { useEffect, useState } from "react";
import Plot from "react-plotly.js";

function Overview() {
  const [data, setData] = useState(null);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // header data
    fetch("http://localhost:5000/header", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch(console.error);

    // growth trend data
    fetch("http://localhost:5000/growth-trend", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTrendData(data.trend);
      })
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

  const dates = trendData.map((d) =>
    new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
  );
  const weights = trendData.map((d) => d.weight ?? 0);

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
      <div className="p-3 rounded">
        <div className="fw-semibold mb-3">Weight Trend (Last 12 Months)</div>
        <Plot
          data={[
            {
              x: dates,
              y: weights,
              type: "scatter",
              mode: "lines+markers",
              marker: { color: "#6b63ff" },
              line: { shape: "spline", smoothing: 0.5, color: "#6b63ff" },
              name: "Weight (kg)",
            },
          ]}
          layout={{
            autosize: true,
            margin: { t: 20, b: 40, l: 40, r: 20 },
            xaxis: { title: "Month" },
            yaxis: { title: "Weight (kg)" },
            showlegend: false,
          }}
          style={{ width: "100%", height: "250px" }}
        />
      </div>
    </div>
  );
}

export default Overview;
