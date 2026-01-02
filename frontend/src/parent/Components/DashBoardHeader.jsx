import style from "../../assets/styleSheets/ParentDashboard.module.css";
import React, { useEffect, useState } from "react";

function DashboardHeader() {
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [childGender, setChildGender] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/header", { credentials: "include" })
      .then((result) => result.json())
      .then((data) => {
        setChildName(data.name);
        setChildAge(data.date_of_birth);
        setChildGender(data.gender);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <header
      className={style.dashboardHeader}
      style={{
        backgroundColor: "#4A90E2",
      }}
    >
      <div className={style.headerContent}>
        <div className={style.childInfoSection}>
          <div className={style.childIcon}>
            {/* change to show the pic the parent adds later from the profile section and maybe add like a default icon to show if a image int added */}
          </div>
          <div className={style.childInfo}>
            <h1 className={style.childName}>{childName}</h1>
            <div className={style.childAge}>{childAge}</div>
          </div>
        </div>
        <div className={style.headerActionsSection}>
          <button className={style.headerIcon}>
            <i className="bi bi-bell"></i>
          </button>
          <button className={style.headerIcon}>
            <i className="bi bi-person"></i>
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
