import { useEffect, useState } from "react";
import style from "../../assets/styleSheets/ParentDashboard.module.css";

function UpcomingEvent() {
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
        <div></div>
      </div>

      {/* Appointments Section */}
      <div className="event-section mb-3">
        <div
          style={{
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          <i className={`bi bi-hospital ${style.HospitalIconCustom}`} style={{ marginRight: 8 }}></i>
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
