import style from "../../assets/styleSheets/ParentDashboard.module.css";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function calculateAge(dobString) {
  const dob = new Date(dobString);
  const today = new Date();

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  }

  if (months > 0) {
    parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  }

  if (years === 0 && days > 0) {
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  }

  return parts.join(", ") + " old";
}

function getInitials(name) {
  if (!name) return "";

  const nameParts = name.trim().split(" ");
  if (nameParts.length === 1) {
    return nameParts[0][0].toUpperCase();
  }

  const firstInitial = nameParts[0][0].toUpperCase();
  const lastInitial = nameParts[nameParts.length - 1][0].toUpperCase();
  return firstInitial + lastInitial;
}
function DashboardHeader() {
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [childGender, setChildGender] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const goToProfile = () => {
    if (!location.pathname.startsWith("/parent/profile")) {
      navigate("/parent/profile");
    }
  };

  const isProfile = location.pathname.startsWith("/parent/profile");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/header", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setChildName(data.name);
        setChildAge(calculateAge(data.date_of_birth));
        setChildGender(data.gender);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <header
      className={style.dashboardHeader}
      style={{
        backgroundColor: childGender === "Male" ? "#4A90E2" : "#f576b5ff",
      }}
    >
      <div className={style.headerContent}>
        <div className={style.childInfoSection}>
          <div className={style.childIcon}>{getInitials(childName)}</div>
          <div className={style.childInfo}>
            <h1 className={style.childName}>{childName}</h1>
            <div className={style.childAge}>{childAge}</div>
          </div>
        </div>
        <div className={style.headerActionsSection}>
          <button className={style.headerIcon}>
            <i className="bi bi-bell"></i>
          </button>
          <button
            className={style.headerIcon}
            onClick={goToProfile}
            disabled={isProfile}
          >
            <i className="bi bi-person"></i>
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
