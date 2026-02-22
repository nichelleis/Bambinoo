import "./DoctorCHDRView.css";

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
  return new Date(dateString).toLocaleDateString();
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
          <i className="ri-file-list-3-line"></i>
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
  const growth = selectedChild.growth || {};
  const allergies = selectedChild.allergies || [];
  const activeConditions = selectedChild.activeConditions || [];
  const vaccines = selectedChild.vaccinations || [];
  const healthNotes = selectedChild.healthNotes || [];

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
        <button className="export-btn">Export CHDR</button>
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
              <span key={i} className="tag danger">{a}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="chdr-grid">

        {/* Growth */}
        <div className="chdrcard">
          <h4>Latest Growth Measurements</h4>
          {growth.weight || growth.height || growth.head ? (
            <div className="CHDRgrowth">
              <div>
                <strong>{growth.weight ?? "N/A"}</strong>
                <span>kg (Weight)</span>
              </div>
              <div>
                <strong>{growth.height ?? "N/A"}</strong>
                <span>cm (Height)</span>
              </div>
              <div>
                <strong>{growth.head ?? "N/A"}</strong>
                <span>cm (Head)</span>
              </div>
            </div>
          ) : (
            <p className="empty-text">No growth records available.</p>
          )}
        </div>

        {/* Immunization */}
        <div className="chdrcard">
          <h4>Immunization Status</h4>
          {vaccines.length === 0 ? (
            <p className="empty-text">No vaccination records found.</p>
          ) : (
            <>
              <p>
                <strong>Total Immunizations</strong>
                <span className="count">
                  {vaccines.filter(v => v.status === "completed").length} / {vaccines.length}
                </span>
              </p>
              <ul>
                {vaccines.map((v, i) => (
                  <li key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span>{v.vaccine_name} ({v.dose_number})</span>
                    <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <small>
                        {v.administered_date
                          ? formatDate(v.administered_date)
                          : v.due_date
                          ? `Due: ${formatDate(v.due_date)}`
                          : "N/A"}
                      </small>
                      <span className={`status ${v.status === "completed" ? "active" : "pending"}`}>
                        {v.status}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Active Conditions */}
        <div className="chdrcard">
          <h4>Active Conditions</h4>
          {activeConditions.length === 0 ? (
            <p className="empty-text">No active conditions recorded.</p>
          ) : (
            activeConditions.map((condition, i) => (
              <p key={i}>
                <strong>{condition}</strong>
                <span className="status active">active</span>
              </p>
            ))
          )}
        </div>

        {/* Health Notes */}
        <div className="chdrcard">
          <h4>Health Notes</h4>
          {healthNotes.length === 0 ? (
            <p className="empty-text">No health notes recorded.</p>
          ) : (
            <ul>
              {healthNotes.map((h, i) => (
                <li key={i} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{h.title || h.record_type}</strong>
                    <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <small>{formatDate(h.record_date)}</small>
                      {h.severity && (
                        <span className={`status ${getSeverityClass(h.severity)}`}>
                          {h.severity}
                        </span>
                      )}
                    </span>
                  </div>
                  <small style={{ color: "#888" }}>{h.record_type}</small>
                  {h.temperature && (
                    <div><small>🌡 {h.temperature}°C</small></div>
                  )}
                  {h.description && (
                    <div><small>{h.description}</small></div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}