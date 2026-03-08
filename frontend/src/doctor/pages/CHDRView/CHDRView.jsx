import "./DoctorCHDRView.css";
import { useEffect } from "react";
import Plotly from "plotly.js-dist";

function calculateAge(dobString) {
  const dob = new Date(dobString);
  const today = new Date();
  const years = today.getFullYear() - dob.getFullYear();
  const months = today.getMonth() - dob.getMonth();
  const totalMonths = years * 12 + months;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  return `${y} year${y !== 1 ? "s" : ""}, ${m} month${m !== 1 ? "s" : ""}`;
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getSeverityClass(severity) {
  if (!severity) return "";
  const s = severity.toLowerCase();
  if (s === "mild") return "pending";
  if (s === "moderate") return "warning";
  if (s === "severe") return "danger";
  return "";
}

export default function CHDRView({ selectedChild }) {
  if (!selectedChild) {
    return (
      <div className="chdr-empty">
        <div className="chdrempty-card">
          <i className="ri-file-list-3-line" />
          <h2>No Patient Selected</h2>
          <p>
            Please search and select a patient to view their
            <br />
            Child Health Development Record (CHDR).
          </p>
        </div>
      </div>
    );
  }

  const dob = selectedChild.date_of_birth;

  const allGrowth = [
    ...(selectedChild.growthHistory || selectedChild.growth_records || []),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const latestGrowth = allGrowth[0] || null;
  const growthHistory = allGrowth.slice(1, 6);

  const allergies = selectedChild.allergies || [];
  const activeConditions = selectedChild.activeConditions || [];
  const vaccines = (selectedChild.vaccinations || []).slice(-5);
  const healthNotes = (selectedChild.healthNotes || []).slice(-5);

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
  };

  const getBMIRiskLevel = (bmi) => {
    if (bmi < 14) return { level: "Severe Underweight", color: "#dc2626" };
    if (bmi < 15) return { level: "Underweight", color: "#f59e0b" };
    if (bmi < 17) return { level: "Normal", color: "#10b981" };
    if (bmi < 18) return { level: "Overweight", color: "#f59e0b" };
    return { level: "Obese", color: "#dc2626" };
  };

  useEffect(() => {
    const growthData =
      selectedChild?.growthHistory || selectedChild?.growth_records || [];

    if (!growthData.length) return;

    const sorted = [...growthData].sort(
      (a, b) =>
        new Date(a.date || a.record_date) - new Date(b.date || b.record_date)
    );

    const dates = sorted.map((g) => formatDate(g.date || g.record_date));
    const heights = sorted.map((g) => g.height);
    const weights = sorted.map((g) => g.weight);
    const bmis = sorted.map((g) => calculateBMI(g.weight, g.height));
    const bmiColors = bmis.map((bmi) =>
      bmi ? getBMIRiskLevel(parseFloat(bmi)).color : "#94a3b8"
    );

    Plotly.react(
      "doctorHeightChart",
      [
        { x: dates, y: heights, type: "scatter", mode: "lines+markers", name: "Height", line: { color: "#3b82f6", width: 3 }, marker: { size: 8 } },
        { x: dates, y: dates.map(() => 115), type: "scatter", mode: "lines", name: "95th Percentile", line: { color: "#10b981", dash: "dash", width: 2 } },
        { x: dates, y: dates.map(() => 107), type: "scatter", mode: "lines", name: "50th Percentile", line: { color: "#f59e0b", dash: "dot", width: 2 } },
        { x: dates, y: dates.map(() => 100), type: "scatter", mode: "lines", name: "5th Percentile", line: { color: "#dc2626", dash: "dash", width: 2 } },
      ],
      { title: { text: "Height Growth Over Time", font: { size: 18, color: "#1e293b" } }, xaxis: { title: { text: "Measurement Date", font: { size: 13, color: "#475569" } }, tickfont: { size: 11 } }, yaxis: { title: { text: "Height (cm)", font: { size: 13, color: "#475569" } }, tickfont: { size: 11 } }, plot_bgcolor: "#f9fafb", paper_bgcolor: "#ffffff" },
      { responsive: true }
    );

    Plotly.react(
      "doctorWeightChart",
      [
        { x: dates, y: weights, type: "scatter", mode: "lines+markers", name: "Weight", line: { color: "#8b5cf6", width: 3 }, marker: { size: 10, color: "#8b5cf6" } },
        { x: dates, y: dates.map(() => 20), type: "scatter", mode: "lines", name: "95th Percentile", line: { color: "#10b981", dash: "dash", width: 2 } },
        { x: dates, y: dates.map(() => 17), type: "scatter", mode: "lines", name: "50th Percentile", line: { color: "#f59e0b", dash: "dot", width: 2 } },
        { x: dates, y: dates.map(() => 14), type: "scatter", mode: "lines", name: "5th Percentile", line: { color: "#dc2626", dash: "dash", width: 2 } },
      ],
      { title: { text: "Weight Growth Over Time", font: { size: 18, color: "#1e293b" } }, xaxis: { title: { text: "Measurement Date", font: { size: 13, color: "#475569" } }, tickfont: { size: 11 } }, yaxis: { title: { text: "Weight (kg)", font: { size: 13, color: "#475569" } }, tickfont: { size: 11 } }, hovermode: "closest", showlegend: true, plot_bgcolor: "#f9fafb", paper_bgcolor: "#ffffff" },
      { responsive: true }
    );

    Plotly.react(
      "BMIChart",
      [
        { x: dates, y: bmis, type: "scatter", mode: "lines+markers", name: "BMI", line: { color: "#ec4899", width: 3 }, marker: { size: 12, color: bmiColors, line: { color: "#fff", width: 2 } } },
        { x: dates, y: dates.map(() => 18), type: "scatter", mode: "lines", name: "Obese (>18)", line: { color: "#dc2626", dash: "dash", width: 2 }, fill: "tonexty", fillcolor: "rgba(220,38,38,0.1)" },
        { x: dates, y: dates.map(() => 17), type: "scatter", mode: "lines", name: "Overweight (17-18)", line: { color: "#f59e0b", dash: "dash", width: 2 }, fill: "tonexty", fillcolor: "rgba(245,158,11,0.1)" },
        { x: dates, y: dates.map(() => 15), type: "scatter", mode: "lines", name: "Normal (15-17)", line: { color: "#10b981", dash: "dash", width: 2 }, fill: "tonexty", fillcolor: "rgba(16,185,129,0.1)" },
        { x: dates, y: dates.map(() => 14), type: "scatter", mode: "lines", name: "Underweight (<15)", line: { color: "#f59e0b", dash: "dash", width: 2 }, fill: "tonexty", fillcolor: "rgba(245,158,11,0.1)" },
      ],
      { title: { text: "<b>BMI Trend with Risk Zones</b>", font: { size: 18, color: "#1e293b", family: "DM Sans, sans-serif" } }, xaxis: { title: { text: "Measurement Date", font: { size: 13, color: "#475569" } }, tickfont: { size: 11 } }, yaxis: { title: { text: "BMI (kg/m²)", font: { size: 13, color: "#475569" } }, tickfont: { size: 11 } }, hovermode: "closest", showlegend: true, plot_bgcolor: "#f9fafb", paper_bgcolor: "#ffffff" },
      { responsive: true }
    );
  }, [selectedChild]);

  return (
    <div className="chdr-page">

      {/* Header */}
      <div className="chdr-header">
        <div className="child-info">
          <div className="avatar">{selectedChild.name[0]}</div>
          <div className="child-info__text">
            <h2>{selectedChild.name}</h2>
            <p>Child Health Development Record (CHDR)</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="chdr-stats">
        <div className="stat-card">
          <span className="stat-card__label">Date of Birth</span>
          <strong className="stat-card__value">{formatDate(dob)}</strong>
          <small className="stat-card__sub">{dob ? calculateAge(dob) : "N/A"}</small>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Gender</span>
          <strong className="stat-card__value">{selectedChild.gender || "N/A"}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Allergies</span>
          <strong className="stat-card__value">{allergies.length}</strong>
          <small className="stat-card__sub">recorded</small>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Active Conditions</span>
          <strong className="stat-card__value">{activeConditions.length}</strong>
          <small className="stat-card__sub">on record</small>
        </div>
      </div>

      {/* Allergy alert */}
      {allergies.length > 0 && (
        <div className="alert-box">
          <div className="alert-box__header">
            <i className="ri-error-warning-fill alert-box__icon" />
            <h4 className="alert-box__title">Known Allergies</h4>
            <span className="alert-box__count">{allergies.length} recorded</span>
          </div>
          <div className="tags">
            {allergies.map((a, i) => (
              <span key={i} className="tag tag--danger">{a}</span>
            ))}
          </div>
        </div>
      )}

      {/* Main 2-column grid */}
      <div className="chdr-grid">

        {/* Growth Card */}
        <div className="chdrcard">
          <div className="chdrcard__header">
            <h4 className="chdrcard__title">Latest Growth Measurements</h4>
            {latestGrowth && (
              <span className="chdrcard__date">
                Recorded {formatDate(latestGrowth.date || latestGrowth.record_date)}
              </span>
            )}
          </div>

          {latestGrowth ? (
            <div className="growth-metric-grid">
              <div className="growth-metric-box">
                <span className="growth-metric-box__value">{latestGrowth.weight ?? "—"}</span>
                <span className="growth-metric-box__unit">kg</span>
                <span className="growth-metric-box__label">Weight</span>
              </div>
              <div className="growth-metric-box">
                <span className="growth-metric-box__value">{latestGrowth.height ?? "—"}</span>
                <span className="growth-metric-box__unit">cm</span>
                <span className="growth-metric-box__label">Height</span>
              </div>
              <div className="growth-metric-box">
                <span className="growth-metric-box__value">{latestGrowth.head ?? "—"}</span>
                <span className="growth-metric-box__unit">cm</span>
                <span className="growth-metric-box__label">Head Circ.</span>
              </div>
            </div>
          ) : (
            <p className="chdrcard__empty">No growth records available.</p>
          )}

          {growthHistory.length > 0 && (
            <div className="growth-history">
              <div className="growth-history__heading">
                <span>Recent History</span>
                <span className="growth-history__cols">
                  <span>Weight</span>
                  <span>Height</span>
                  <span>Head</span>
                </span>
              </div>
              <ul className="growth-history__list">
                {growthHistory.map((g, i) => (
                  <li key={i} className="growth-history__row">
                    <span className="growth-history__row-date">
                      {formatDate(g.date || g.record_date)}
                    </span>
                    <span className="growth-history__row-values">
                      <span><strong>{g.weight ?? "—"}</strong> kg</span>
                      <span><strong>{g.height ?? "—"}</strong> cm</span>
                      <span><strong>{g.head ?? "—"}</strong> cm</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Immunization Card */}
        <div className="chdrcard">
          <div className="chdrcard__header">
            <h4 className="chdrcard__title">Immunization Status</h4>
            <span className="chdrcard__badge">{vaccines.length} of latest 5</span>
          </div>

          {vaccines.length === 0 ? (
            <p className="chdrcard__empty">No vaccination records found.</p>
          ) : (
            <ul className="vaccine-list">
              {vaccines.map((v, i) => (
                <li key={i} className="vaccine-row">
                  <span className="vaccine-row__name">
                    {v.vaccine_name}
                    {v.dose_number && (
                      <span className="vaccine-row__dose">Dose {v.dose_number}</span>
                    )}
                  </span>
                  <span className="vaccine-row__right">
                    <span className="vaccine-row__date">
                      {v.administered_date
                        ? formatDate(v.administered_date)
                        : v.due_date
                          ? `Due: ${formatDate(v.due_date)}`
                          : "N/A"}
                    </span>
                    <span className={`status-badge status-badge--${v.status === "completed" ? "active" : "pending"}`}>
                      {v.status || "—"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Active Conditions Card */}
        <div className="chdrcard">
          <div className="chdrcard__header">
            <h4 className="chdrcard__title">Active Conditions</h4>
            <span className="chdrcard__badge">{activeConditions.length} total</span>
          </div>

          {activeConditions.length === 0 ? (
            <p className="chdrcard__empty">No active conditions recorded.</p>
          ) : (
            <ul className="condition-list">
              {activeConditions.map((condition, i) => (
                <li key={i} className="condition-row">
                  <span className="condition-row__index">{i + 1}</span>
                  <span className="condition-row__name">{condition}</span>
                  <span className="status-badge status-badge--active">Active</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Health Notes Card */}
        <div className="chdrcard">
          <div className="chdrcard__header">
            <h4 className="chdrcard__title">Health Notes</h4>
            <span className="chdrcard__badge">Latest 5</span>
          </div>

          {healthNotes.length === 0 ? (
            <p className="chdrcard__empty">No health notes recorded.</p>
          ) : (
            <ul className="note-list">
              {healthNotes.map((h, i) => (
                <li key={i} className="note-item">
                  <div className="note-item__top">
                    <span className="note-item__title">{h.title || h.record_type}</span>
                    {h.severity && (
                      <span className={`status-badge status-badge--${getSeverityClass(h.severity)}`}>
                        {h.severity}
                      </span>
                    )}
                  </div>
                  <div className="note-item__sub">
                    <span className="note-item__type">{h.record_type}</span>
                    <span className="note-item__date">{formatDate(h.record_date)}</span>
                  </div>
                  {(h.temperature || h.description) && (
                    <div className="note-item__body">
                      {h.temperature && (
                        <span className="note-item__temp">🌡 {h.temperature}°C</span>
                      )}
                      {h.description && (
                        <p className="note-item__desc">{h.description}</p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="nurse-card nurse-card--full">
        <div id="doctorHeightChart" className="nurse-chart" />
      </div>

      <div className="nurse-card nurse-card--full">
        <div id="doctorWeightChart" className="nurse-chart" />
      </div>

      <div className="nurse-card nurse-card--full">
        <div id="BMIChart" className="nurse-chart" />
      </div>

      {/* Full Vaccination Table */}
      <div className="nurse-card nurse-card--full">
        <div className="nurse-card__header">
          <h4 className="nurse-card__title">
            <i className="ri-syringe-line" />
            Complete Vaccination History
          </h4>
          <span className="nurse-card__count">
            {(selectedChild.vaccinations || []).length} records
          </span>
        </div>
        <div className="nurse-divider" />

        {(selectedChild.vaccinations || []).length === 0 ? (
          <p className="nurse-empty-text">No vaccination records available.</p>
        ) : (
          <div className="nurse-table-wrapper">
            <table className="nurse-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vaccine</th>
                  <th>Date Given</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(selectedChild.vaccinations || []).map((v, i) => (
                  <tr key={i}>
                    <td className="nurse-table__index">{i + 1}</td>
                    <td>
                      <span className="nurse-table__vaccine-name">{v.vaccine_name}</span>
                      {v.dose_number && (
                        <span className="nurse-table__dose">Dose {v.dose_number}</span>
                      )}
                    </td>
                    <td className="nurse-table__date">
                      {v.administered_date ? formatDate(v.administered_date) : "—"}
                    </td>
                    <td>
                      <span className={`nurse-badge nurse-badge--${v.status === "completed" ? "completed" : "pending"}`}>
                        {v.status || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
