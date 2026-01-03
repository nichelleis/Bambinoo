import { useEffect, useState } from "react";
import style from "../../assets/styleSheets/ParentDashboard.module.css";

function UpcomingEvent() {
  const [vaccines, setVaccines] = useState([]);
  const [appointments, setAppointments] = useState([]);

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

    fetch("http://127.0.0.1:5000/upcoming-appointments", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setAppointments(data))
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
      <div className="event-section mb-3">
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
              className={`${style.eventItem} p-3 mb-2 ${
                vaccine.status === "missed"
                  ? style.vaccineMissed
                  : style.vaccineUpcoming
              }`}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className={style.upcomingInfo}>
                  <strong>
                    {vaccine.vaccine_name} ({vaccine.dose_number})
                  </strong>
                  <div className={style.upcomingDate}>
                    {formatDate(vaccine.due_date)}
                  </div>
                  <div className={style.upcomingDate}>
                    <i
                      className={`bi bi-exclamation-triangle-fill ${style.exclamationIconCustom}`}
                    ></i>{" "}
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
      <div className="event-section mb-2">
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
        <div
          style={{
            maxHeight: appointments.length > 1 ? "128px" : "auto",
            overflowY: appointments.length > 1 ? "auto" : "visible",
          }}
        >
          {appointments.length === 0 && <div>No upcoming appointments</div>}
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className={`${style.eventItem} ${style.appointmentEvent} p-3 mb-2`}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{appt.appointment_type}</strong>
                  <div className={style.doctor}>{appt.doctor_name}</div>
                  <div className={style.upcomingDate}>
                    {formatDate(appt.appointment_date)} at{" "}
                    {new Date(appt.appointment_date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className={style.upcomingDate}>
                    <i
                      className={`bi bi-exclamation-triangle-fill ${style.exclamationIconCustom}`}
                    ></i>
                    {daysFromNow(appt.appointment_date)}
                  </div>
                </div>
                <div className="d-flex gap-2 mt-2">
                  <button className="btn btn-sm btn-outline-primary">
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-outline-primary w-100">
        <i className="bi bi-plus-lg"></i> Add New Appointment
      </button>
    </div>
  );
}

export default UpcomingEvent;
