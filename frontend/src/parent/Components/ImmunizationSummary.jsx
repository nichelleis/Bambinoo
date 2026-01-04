import style from "../../assets/styleSheets/ParentDashboard.module.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ImmunizationSummary() {
  const [completedVaccines, setCompletedVaccines] = useState([]);
  const [totalExpected, setTotalExpected] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompletedVaccines();
    fetchTotalExpected();
  }, []);

  const fetchCompletedVaccines = async () => {
    const token = localStorage.getItem("token");
    const completedRes = await fetch(
      "http://127.0.0.1:5000/completed-vaccines",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const completedData = await completedRes.json();

    setCompletedVaccines(completedData);
  };

  const fetchTotalExpected = async () => {
    const res = await fetch("http://127.0.0.1:5000/total-vaccines-count");
    const data = await res.json();
    setTotalExpected(data.total);
  };

  const completedCount = completedVaccines.length;
  const progress =
    totalExpected > 0 ? Math.round((completedCount / totalExpected) * 100) : 0;

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
            {progress}% Complete
          </span>
        </div>
        <div className="progress mb-2" style={{ height: "10px" }}>
          <div
            className="progress-bar bg-success"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h6 className={`${style.immunizationHeading} text-muted mb-2`}>
        Recently Completed
      </h6>

      {completedVaccines.slice(0, 4).map((v, index) => (
        <div
          key={index}
          className={`${style.completedVaccineCard} d-flex align-items-center mb-2`}
        >
          <i className="bi bi-check-circle-fill text-success p-2 me-2"></i>
          <div>
            <div
              className={`${style.completedVaccineCardMainText} fw-semibold`}
            >
              {v.vaccine_name} ({v.dose_number})
            </div>
            <small className={`${style.completedVaccineCardText} text-muted`}>
              Completed: {new Date(v.administered_date).toLocaleDateString()}
            </small>
          </div>
        </div>
      ))}

      {completedCount === 0 && (
        <div className="text-muted text-center mt-3 mb-3">
          No vaccines recorded yet
        </div>
      )}

      <button
        className="btn btn-outline-primary w-100"
        onClick={() => navigate("/parent/analytics")}
      >
        View All Vaccinations <i className="bi bi-arrow-right"></i>
      </button>
    </div>
  );
}

export default ImmunizationSummary;
