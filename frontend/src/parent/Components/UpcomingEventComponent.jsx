import { useEffect, useState } from "react";
import style from "../../assets/styleSheets/ParentDashboard.module.css";

function UpcomingEvent() {
  const [vaccines, setVaccines] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:5000/vaccines-status", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setVaccines(data))
      .catch((err) => console.error(err));
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const daysFromNow = (dateStr) => {
    const d = new Date(dateStr);
    const diff = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `In ${diff} day${diff > 1 ? "s" : ""}` : "Today";
  };

  return (
    <div className={`card ${style.dashboardCard}`}>
      <div className={style.cardHeaderCustom}>
        <div className={`mb-3 ${style.cardTitle}`}>
          <span className={`${style.cardIcon} ${style.iconYellow}`}>
            <i className="bi bi-calendar-check-fill"></i>
          </span>
          Upcoming Events
        </div>
      </div>

      {/* Vaccines Section */}
      <div className="event-section mb-4">
        <div
          style={{
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          <i
            className={`bi bi-shield-check ${style.shieldIconCustom}`}
            style={{ marginRight: 8 }}
          ></i>
          Vaccines
        </div>
        <div
          style={{
            maxHeight: vaccines.length > 2 ? "210px" : "auto",
            overflowY: vaccines.length > 2 ? "auto" : "visible",
          }}
        >
          {vaccines.length === 0 && <div>No upcoming vaccines</div>}
          {vaccines.map((vaccine) => (
            <div
              key={vaccine.id}
              className={`event-item p-3 mb-2 ${
                vaccine.status === "missed"
                  ? "vaccine-missed"
                  : "vaccine-upcoming"
              } `}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="upcoming-info">
                  <strong>
                    {vaccine.vaccine_name} ({vaccine.dose_number})
                  </strong>
                  <div className="upcoming-date">
                    {formatDate(vaccine.due_date)}
                  </div>
                  <div className="upcoming-date">
                    <i className="bi bi-exclamation-triangle-fill"></i>{" "}
                    {vaccine.status === "missed"
                      ? "Missed"
                      : daysFromNow(vaccine.due_date)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointments Section */}
      <div className="event-section mb-3">
        <div
          style={{
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          <i
            className={`bi bi-hospital ${style.HospitalIconCustom}`}
            style={{ marginRight: 8 }}
          ></i>
          Appointments
        </div>
        <div></div>
      </div>

      <button className="btn btn-outline-primary w-100">
        <i className="bi bi-plus-lg"></i> Add New Appointment
      </button>
    </div>
  );
}

export default UpcomingEvent;
