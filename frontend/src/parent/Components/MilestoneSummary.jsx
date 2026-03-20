import style from "../../assets/styleSheets/ParentDashboard.module.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DevelopmentMilestonesCard() {
  const [milestones, setMilestones] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(
      "https://stark-harbor-79359-9d7adf515fd1.herokuapp.com/milestone-status",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((res) => res.json())
      .then((data) => setMilestones(data))
      .catch((err) => console.error(err));
  }, []);

  const iconMap = {
    Physical: "bi bi-person-arms-up",
    Language: "bi bi-chat",
    Social: "bi bi-person",
    Cognitive: "bi bi-lightbulb",
  };

  const colorMap = {
    Physical: "var(--primary)",
    Language: "var(--secondary)",
    Social: "var(--accent)",
    Cognitive: "var(--success)",
  };

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
      {milestones.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "var(--text-muted)",
            padding: "20px 0",
            fontSize: 14,
          }}
        >
          No development milestones available
        </div>
      ) : (
        milestones.map((m, idx) => (
          <div className="milestone-category mb-4" key={idx}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>
                <i
                  className={iconMap[m.category]}
                  style={{ color: colorMap[m.category], marginRight: 8 }}
                ></i>
                <strong>{m.category}</strong>
              </span>
              <span style={{ color: "var(--success)", fontWeight: 600 }}>
                {m.completed}/{m.total}
              </span>
            </div>

            <div className="progress" style={{ height: 8, borderRadius: 10 }}>
              <div
                className="progress-bar"
                style={{
                  width: `${m.percentage}%`,
                  background: colorMap[m.category],
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
              {m.description}
            </div>
          </div>
        ))
      )}

      <button
        className="btn btn-outline-primary w-100 mt-2"
        onClick={() => navigate("/parent/milestones")}
      >
        View Detailed Milestones <i className="bi bi-arrow-right"></i>
      </button>
    </div>
  );
}

export default DevelopmentMilestonesCard;
