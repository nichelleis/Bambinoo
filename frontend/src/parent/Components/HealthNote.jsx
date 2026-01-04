import style from "../../assets/styleSheets/ParentDashboard.module.css";

function HealthNote() {
  return (
    <div className={`card ${style.dashboardCard}`}>
      <div className={style.cardHeaderCustom}>
        <div className={`mb-3 ${style.cardTitle}`}>
          <span className={`${style.cardIcon} ${style.iconRed}`}>
            <i className="bi bi-exclamation-octagon-fill"></i>
          </span>
          Quick Health Record
        </div>
      </div>

      <div
        className="text-center mb-3"
        style={{
          fontSize: "14px",
          color: "var(--text-muted)",
          cursor: "pointer",
        }}
      >
        Click a section to record health data
      </div>

      <div className={style.healthWheel}>
        <div className={`${style.quadrant} ${style.temp}`}>
          <i className="bi bi-thermometer-half"></i>
          <span>Temperature</span>
        </div>

        <div className={`${style.quadrant} ${style.meds}`}>
          <i className="bi bi-capsule"></i>
          <span>Medication</span>
        </div>

        <div className={`${style.quadrant} ${style.symptoms}`}>
          <i className="bi bi-activity"></i>
          <span className={style.symptomsSpan}>Symptoms</span>
        </div>

        <div className={`${style.quadrant} ${style.notes}`}>
          <i className="bi bi-journal-text"></i>
          <span>Notes</span>
        </div>
      </div>
    </div>
  );
}

export default HealthNote;
