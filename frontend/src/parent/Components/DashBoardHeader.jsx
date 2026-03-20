import style from "../../assets/styleSheets/ParentDashboard.module.css";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

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
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [alertsLoaded, setAlertsLoaded] = useState(false);
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

    fetch("https://stark-harbor-79359-9d7adf515fd1.herokuapp.com/header", {
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(
      "https://stark-harbor-79359-9d7adf515fd1.herokuapp.com/health-alerts",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setAlerts(Array.isArray(data) ? data : []);
        setAlertsLoaded(true);
      })
      .catch((err) => console.error("Alert fetch failed:", err));

    const socket = io("https://stark-harbor-79359-9d7adf515fd1.herokuapp.com", {
      auth: { token },
    });
    socket.on("health_alert", (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (!showAlerts) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest("[data-alert-drawer]")) {
        setShowAlerts(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAlerts]);

  const markRead = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(
      `https://stark-harbor-79359-9d7adf515fd1.herokuapp.com/health-alerts/${id}/read`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)),
    );
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    await fetch(
      "hhttps://stark-harbor-79359-9d7adf515fd1.herokuapp.com/health-alerts/read-all",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
  };

  const unreadCount = alerts.filter((a) => !a.is_read).length;

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
          <div style={{ position: "relative" }} data-alert-drawer>
            <button
              className={style.headerIcon}
              onClick={() => setShowAlerts((prev) => !prev)}
              style={{ position: "relative" }}
            >
              <i className="bi bi-bell"></i>
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #fff",
                    lineHeight: 1,
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showAlerts && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  width: "340px",
                  maxHeight: "420px",
                  background: "#fff",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                  zIndex: 9999,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    padding: "14px 18px",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#1e293b",
                    }}
                  >
                    Health Alerts
                    {unreadCount > 0 && (
                      <span
                        style={{
                          marginLeft: "8px",
                          background: "#fef2f2",
                          color: "#ef4444",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          borderRadius: "99px",
                          padding: "2px 8px",
                          border: "1px solid #fecaca",
                        }}
                      >
                        {unreadCount} new
                      </span>
                    )}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.78rem",
                        color: "#6366f1",
                        fontWeight: 600,
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ overflowY: "auto", flex: 1 }}>
                  {!alertsLoaded ? (
                    <div
                      style={{
                        padding: "32px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "0.85rem",
                      }}
                    >
                      Loading…
                    </div>
                  ) : alerts.length === 0 ? (
                    <div style={{ padding: "32px", textAlign: "center" }}>
                      <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                        ✅
                      </div>
                      <p
                        style={{
                          color: "#64748b",
                          fontSize: "0.85rem",
                          margin: 0,
                        }}
                      >
                        No health alerts. Everything looks good!
                      </p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => !alert.is_read && markRead(alert.id)}
                        style={{
                          padding: "13px 18px",
                          borderBottom: "1px solid #f8f8f8",
                          background: alert.is_read ? "#fff" : "#fffbeb",
                          cursor: alert.is_read ? "default" : "pointer",
                          display: "flex",
                          gap: "12px",
                          alignItems: "flex-start",
                          transition: "background 0.15s",
                        }}
                      >
                        <div
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "50%",
                            flexShrink: 0,
                            background:
                              alert.severity === "critical"
                                ? "#fef2f2"
                                : "#fffbeb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1rem",
                          }}
                        >
                          {alert.severity === "critical" ? "🚨" : "⚠️"}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginBottom: "3px",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: "0.82rem",
                                color: "#1e293b",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {alert.title}
                            </span>
                            {!alert.is_read && (
                              <span
                                style={{
                                  width: "7px",
                                  height: "7px",
                                  borderRadius: "50%",
                                  background: "#ef4444",
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </div>
                          <p
                            style={{
                              fontSize: "0.76rem",
                              color: "#64748b",
                              margin: 0,
                              lineHeight: 1.45,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {alert.message}
                          </p>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: "#94a3b8",
                              marginTop: "4px",
                              display: "block",
                            }}
                          >
                            {alert.age_months != null
                              ? `At ${alert.age_months} months · `
                              : ""}
                            {new Date(alert.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
