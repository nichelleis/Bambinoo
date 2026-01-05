import style from "../../assets/styleSheets/ParentDashboard.module.css";
import { useEffect, useState } from "react";

function Milestones() {
  const [ageGroups, setAgeGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [milestones, setMilestones] = useState({});

  useEffect(() => {
    fetch("http://127.0.0.1:5000/age-groups")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((group) => ({
          ...group,
          text: getAgeGroupText(group.id),
        }));
        setAgeGroups(mapped);
        fetchMilestones(mapped[1]?.id || "all");
      });
  }, []);

  const fetchMilestones = (group) => {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:5000/milestones?age_group=${group}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setMilestones(data))
      .catch((err) => console.error(err));

    setSelectedGroup(group);
  };

  const getProgressData = () => {
    const progress = {};

    Object.entries(milestones).forEach(([category, items]) => {
      const total = items.length;
      const completed = items.filter((m) => m.completed).length;
      const percentage = total ? Math.round((completed / total) * 100) : 0;

      progress[category] = { total, completed, percentage };
    });

    return progress;
  };

  const categoryConfig = {
    Motor: {
      icon: <i className="bi bi-person-walking"></i>,
      color: "#6C63FF",
      bgColor: "rgba(108, 99, 255, 0.1)",
    },
    Language: {
      icon: <i className="bi bi-chat-dots-fill"></i>,
      color: "#FF6B9D",
      bgColor: "rgba(255, 107, 157, 0.1)",
    },
    Cognitive: {
      icon: <i className="bi bi-lightbulb-fill"></i>,
      color: "#FEC163",
      bgColor: "rgba(254, 193, 99, 0.1)",
    },
    Social: {
      icon: <i className="bi bi-people-fill"></i>,
      color: "#4CAF50",
      bgColor: "rgba(76, 175, 80, 0.1)",
    },
  };

  const getAgeGroupText = (id) => {
    if (id === "all") return "All Ages";
    if (id === 0) return "Birth";
    if (id < 12) return `${id} month${id > 1 ? "s" : ""}`;
    if (id === 12) return "1 year";
    if (id === 24) return "2 years";
    if (id === 36) return "3 years";
    if (id === 48) return "4 years";
    if (id === 60) return "5 years";
    return `${id} months`;
  };

  return (
    <div className={style.milestoneContainer}>
      <div className={style.milestoneHeader}>
        <div className={style.headerContent}>
          <div className={style.headerText}>
            <h2 className={style.headerTitle}>
              <i className="bi bi-stars me-3"></i>
              Development Milestones
            </h2>
            <p className={style.headerSubtitle}>
              Track your little one's amazing journey
            </p>
          </div>
        </div>
      </div>

      <div className={`${style.ageGroupFilter} ${style.dashboardCard}`}>
        <div className={style.filterLabel}>
          <i className="bi bi-funnel me-2"></i>
          Filter by Age
        </div>
        <div className={style.ageGroupButtons}>
          {ageGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => fetchMilestones(group.id)}
              className={`${style.ageBtn} ${
                selectedGroup === group.id ? style.active : ""
              }`}
            >
              {group.text}
            </button>
          ))}
        </div>
      </div>
      <div className={style.milestoneGrid}>
        <div className={style.milestonesSection}>
          {Object.keys(milestones).length === 0 ? (
            <div className={style.emptyState}>
              <h3>No milestones for this age group</h3>
              <p>Could not find any milestones</p>
            </div>
          ) : (
            Object.entries(milestones).map(([category, items]) => {
              const config = categoryConfig[category] || categoryConfig.Motor;
              const progressData = getProgressData()[category];

              return (
                <div key={category} className={style.categoryCard}>
                  <div
                    className={style.categoryHeader}
                    style={{ borderLeftColor: config.color }}
                  >
                    <div className={style.categoryTitle}>
                      <span
                        className={style.categoryIcon}
                        style={{ color: config.color }}
                      >
                        {config.icon}
                      </span>
                      <h3>{category} Skills</h3>
                    </div>
                    <div
                      className={style.categoryBadge}
                      style={{
                        backgroundColor: config.bgColor,
                        color: config.color,
                      }}
                    >
                      {progressData.completed}/{progressData.total}
                    </div>
                  </div>

                  <div className={style.categoryProgressBar}>
                    <div
                      className={style.categoryProgressFill}
                      style={{
                        width: `${progressData.percentage}%`,
                        backgroundColor: config.color,
                      }}
                    ></div>
                  </div>

                  <div className={style.milestoneList}>
                    {items.map((m) => (
                      <div
                        key={m.id}
                        className={`${style.milestoneItem} ${
                          m.completed ? style.completed : ""
                        }`}
                      >
                        <label className={style.milestoneCheckbox}>
                          <input type="checkbox" checked={m.completed} />
                          <span
                            className={style.checkboxCustom}
                            style={{ borderColor: config.color }}
                          >
                            <i className="bi bi-check-lg"></i>
                          </span>
                        </label>

                        <div className={style.milestoneContent}>
                          <span className={style.milestoneText}>
                            {m.description}
                          </span>
                          {m.completed && (
                            <span className={style.completionBadge}>
                              <i className="bi bi-trophy-fill me-1"></i>
                              Achieved!
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Milestones;
