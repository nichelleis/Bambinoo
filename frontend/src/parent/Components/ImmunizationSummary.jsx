import style from "../../assets/styleSheets/ParentDashboard.module.css";
import { useEffect, useState } from "react";

function ImmunizationSummary() {
  const [completedVaccines, setCompletedVaccines] = useState([]);
  const [totalExpected, setTotalExpected] = useState(0);

  useEffect(() => {
    fetchCompletedVaccines();
    fetchTotalExpected();
  }, []);

  const fetchCompletedVaccines = async () => {
    const token = localStorage.getItem("token");
    const completedRes = await fetch("http://127.0.0.1:5000/milestone-status", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const completedData = await completedRes.json();

    setCompletedVaccines(completedData);
  };

  const fetchTotalExpected = async () => {
    const res = await fetch("http://127.0.0.1:5000/total-vaccines-count");
    const data = await res.json();
    setTotalExpected(data.total);
  };

  return (
    <div className={`card ${style.dashboardCard}`}>
      <div className={style.cardHeaderCustom}>
        <div className={`mb-3 ${style.cardTitle}`}>
          <span className={`${style.cardIcon} ${style.iconPurple}`}>
            <i className="bi bi-shield-plus"></i>
          </span>
          Immunization Status
        </div>
      </div>

      <div className="progress-section mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2 mt-2">
          <span
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: "var(--text-muted)",
            }}
          >
            Vaccination Progress
          </span>
          <span className={`${style.badgeStatus} ${style.badgeCompleted}`}>
            25% Complete
          </span>
        </div>
        <div className="progress mb-2" style={{ height: "10px" }}>
          <div className="progress-bar bg-success" style={{ width: `25%` }} />
        </div>
      </div>

      <h6 className={`${style.immunizationHeading} text-muted mb-2`}>
        Recently Completed
      </h6>

      <div
        className={`${style.completedVaccineCard} d-flex align-items-center mb-2`}
      >
        <i className="bi bi-check-circle-fill text-success p-2 me-2"></i>
        <div>
          <div className={`${style.completedVaccineCardMainText} fw-semibold`}>
            MVP dose 1
          </div>
          <small className={`${style.completedVaccineCardText} text-muted`}>
            Completed: 2025/01/21
          </small>
        </div>
      </div>

      <button className="btn btn-outline-primary w-100">
        View All Vaccinations <i className="bi bi-arrow-right"></i>
      </button>
    </div>
  );
}

export default ImmunizationSummary;
