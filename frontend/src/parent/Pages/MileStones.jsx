import style from "../../assets/styleSheets/ParentDashboard.module.css";
import { useEffect, useState } from "react";

function Milestones() {
  const [ageGroups, setAgeGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("all");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/age-groups")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((group) => ({
          ...group,
          text: getAgeGroupText(group.id),
        }));
        setAgeGroups(mapped);
      });
  }, []);

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
              onClick={() => setSelectedGroup(group.id)}
              className={`${style.ageBtn} ${
                selectedGroup === group.id ? style.active : ""
              }`}
            >
              {group.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Milestones;
