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

  useEffect(() => {
    const growthData =
      selectedChild?.growthHistory || selectedChild?.growth_records || [];

    if (!growthData.length) return;

    const sorted = [...growthData].sort(
      (a, b) =>
        new Date(a.date || a.record_date) - new Date(b.date || b.record_date),
    );

    const dates = sorted.map((g) => formatDate(g.date || g.record_date));

    const heights = sorted.map((g) => g.height);

    Plotly.react(
      "doctorHeightChart",
      [
        {
          x: dates,
          y: heights,
          type: "scatter",
          mode: "lines+markers",
          name: "Height",
          line: { color: "#3b82f6", width: 3 },
          marker: { size: 8 },
        },
        {
          x: dates,
          y: dates.map(() => 115),
          type: "scatter",
          mode: "lines",
          name: "95th Percentile",
          line: { color: "#10b981", dash: "dash", width: 2 },
        },
        {
          x: dates,
          y: dates.map(() => 107),
          type: "scatter",
          mode: "lines",
          name: "50th Percentile",
          line: { color: "#f59e0b", dash: "dot", width: 2 },
        },
        {
          x: dates,
          y: dates.map(() => 100),
          type: "scatter",
          mode: "lines",
          name: "5th Percentile",
          line: { color: "#dc2626", dash: "dash", width: 2 },
        },
      ],
      {
        title: {
          text: "Height Growth Over Time",
          font: { size: 18, color: "#1e293b" },
        },
        xaxis: {
          title: {
            text: "Measurement Date",
            font: { size: 13, color: "#475569" },
          },
          tickfont: { size: 11 },
        },
        yaxis: {
          title: { text: "Height (cm)", font: { size: 13, color: "#475569" } },
          tickfont: { size: 11 },
        },
        plot_bgcolor: "#f9fafb",
        paper_bgcolor: "#ffffff",
      },
      { responsive: true },
    );
  }, [selectedChild]);

  return (
    <div className="chdr-page">
      {/* ── Header ── */}
      <div className="chdr-header">
        <div className="child-info">
          <div className="avatar">{selectedChild.name[0]}</div>
          <div>
            <h2>{selectedChild.name}</h2>
            <p>Child Health Development Record (CHDR)</p>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="chdr-stats">
        <div className="stat-card">
          <span>Date of Birth</span>
          <strong>{formatDate(dob)}</strong>
          <small>{dob ? calculateAge(dob) : "N/A"}</small>
        </div>
        <div className="chdrstat-card">
          <span>Gender</span>
          <strong>{selectedChild.gender || "N/A"}</strong>
        </div>
        <div className="chdrstat-card">
          <span>Allergies</span>
          <strong>{allergies.length}</strong>
          <small>recorded</small>
        </div>
        <div className="chdrstat-card">
          <span>Active Conditions</span>
          <strong>{activeConditions.length}</strong>
        </div>
      </div>

      {/* ── Allergy alert ── */}
      {allergies.length > 0 && (
        <div className="alert-box">
          <h4>⚠ Known Allergies</h4>
          <div className="tags">
            {allergies.map((a, i) => (
              <span key={i} className="tag danger">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="chdr-grid">
        {/* ── Growth ── */}
        <div className="chdrcard">
          <h4>Latest Growth Measurements</h4>
          {latestGrowth ? (
            <>
              <small>
                Recorded on{" "}
                {formatDate(latestGrowth.date || latestGrowth.record_date)}
              </small>
              <div className="CHDRgrowth">
                <div>
                  <strong>{latestGrowth.weight ?? "N/A"}</strong>
                  <span>kg (Weight)</span>
                </div>
                <div>
                  <strong>{latestGrowth.height ?? "N/A"}</strong>
                  <span>cm (Height)</span>
                </div>
                <div>
                  <strong>{latestGrowth.head ?? "N/A"}</strong>
                  <span>cm (Head)</span>
                </div>
              </div>
            </>
          ) : (
            <p className="empty-text">No growth records available.</p>
          )}

          {growthHistory.length > 0 && (
            <>
              <h5>Recent Growth History</h5>
              <ul className="growth-history-list">
                {growthHistory.map((g, i) => (
                  <li key={i} className="growth-history-row">
                    <span className="growth-history-row__date">
                      {formatDate(g.date || g.record_date)}
                    </span>
                    <span className="growth-history-row__values">
                      <span>
                        <strong>{g.weight ?? "N/A"}</strong> kg
                      </span>
                      <span>
                        <strong>{g.height ?? "N/A"}</strong> cm
                      </span>
                      <span>
                        <strong>{g.head ?? "N/A"}</strong> cm
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* ── Immunization ── */}
        <div className="chdrcard">
          <h4>
            Immunization Status <small className="panel-sub">(Latest 5)</small>
          </h4>
          {vaccines.length === 0 ? (
            <p className="empty-text">No vaccination records found.</p>
          ) : (
            <>
              <p>Total Immunizations: {vaccines.length}</p>
              <ul>
                {vaccines.map((v, i) => (
                  <li key={i}>
                    <span>
                      {v.vaccine_name}
                      {v.dose_number ? ` (${v.dose_number})` : ""}
                    </span>
                    <span className="li-right">
                      <small>
                        {v.administered_date
                          ? formatDate(v.administered_date)
                          : v.due_date
                            ? `Due: ${formatDate(v.due_date)}`
                            : "N/A"}
                      </small>
                      <span
                        className={`status ${v.status === "completed" ? "active" : "pending"}`}
                      >
                        {v.status || "—"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* ── Active Conditions ── */}
        <div className="chdrcard">
          <h4>Active Conditions</h4>
          {activeConditions.length === 0 ? (
            <p className="empty-text">No active conditions recorded.</p>
          ) : (
            <ul>
              {activeConditions.map((condition, i) => (
                <li key={i} className="condition-item">
                  <span>{condition}</span>
                  <span className="status active">active</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Health Notes ── */}
        <div className="chdrcard">
          <h4>
            Health Notes <small className="panel-sub">(Latest 5)</small>
          </h4>
          {healthNotes.length === 0 ? (
            <p className="empty-text">No health notes recorded.</p>
          ) : (
            <ul className="health-notes-list">
              {healthNotes.map((h, i) => (
                <li key={i} className="health-note-item">
                  <div className="health-note-item__header">
                    <strong>{h.title || h.record_type}</strong>
                    <div className="health-note-item__meta">
                      <small>{formatDate(h.record_date)}</small>
                      {h.severity && (
                        <span
                          className={`status ${getSeverityClass(h.severity)}`}
                        >
                          {h.severity}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="health-note-item__type">
                    {h.record_type}
                  </span>
                  {h.temperature && (
                    <div className="health-note-item__detail">
                      🌡 {h.temperature}°C
                    </div>
                  )}
                  {h.description && (
                    <div className="health-note-item__detail">
                      {h.description}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/*Weight Chart*/}
      <div className="nurse-card nurse-card--full">
        <div id="doctorHeightChart" className="nurse-chart"></div>
      </div>

      {/*full vaccination history table*/}
      <div className="nurse-card nurse-card--full">
        <h4 className="nurse-card-title">
          <i className="ri-syringe-line" /> Complete Vaccination History
        </h4>
        <div className="nurse-divider" />

        {(selectedChild.vaccinations || []).length === 0 ? (
          <p className="nurse-empty-text">No vaccination records available.</p>
        ) : (
          <div className="nurse-table-wrapper">
            <table className="nurse-table">
              <thead>
                <tr>
                  <th>Vaccine</th>
                  <th>Date Given</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(selectedChild.vaccinations || []).map((v, i) => (
                  <tr key={i}>
                    <td>
                      <strong>
                        {v.vaccine_name}
                        {v.dose_number ? ` (${v.dose_number})` : ""}
                      </strong>
                    </td>
                    <td>
                      {v.administered_date
                        ? formatDate(v.administered_date)
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`nurse-badge ${
                          v.status === "completed"
                            ? "nurse-badge--completed"
                            : "nurse-badge--pending"
                        }`}
                      >
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
