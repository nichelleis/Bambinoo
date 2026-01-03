import { useEffect, useState } from "react";
import style from "../../assets/styleSheets/ParentDashboard.module.css";

function UpcomingEvent() {
  const [vaccines, setVaccines] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    appointment_type: "",
    doctor_name: "",
    appointment_date: "",
    appointment_time: "",
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "appointment_type" && value.length > 50) return;
    setForm({ ...form, [name]: value });
  };

  const Submit = () => {
    const dateTime = form.appointment_date + "T" + form.appointment_time;
    const payload = {
      appointment_type: form.appointment_type,
      doctor_name: form.doctor_name,
      appointment_date: dateTime,
    };

    const url = "http://127.0.0.1:5000/add-appointment";

    const method = "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isEditing) {
          setAppointments(
            appointments.map((a) => (a.id === editingId ? data : a))
          );
        } else {
          setAppointments([...appointments, data]);
        }

        resetModal();
      });
  };

  const handleEdit = (appt) => {
    const dt = new Date(appt.appointment_date);

    setForm({
      appointment_type: appt.appointment_type,
      doctor_name: appt.doctor_name,
      appointment_date: dt.toISOString().split("T")[0],
      appointment_time: dt.toTimeString().slice(0, 5),
    });

    setIsEditing(true);
    setEditingId(appt.id);
    setShowModal(true);
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
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleEdit(appt)}
                  >
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

      <button
        className="btn btn-outline-primary w-100"
        onClick={() => setShowModal(true)}
      >
        <i className="bi bi-plus-lg"></i> Add New Appointment
      </button>

      {showModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-card p-4">
            <h5>Add Appointment</h5>
            <hr />

            <div className="mb-2 d-flex gap-2">
              <input
                type="text"
                name="appointment_type"
                placeholder="Appointment Type"
                value={form.appointment_type}
                onChange={handleChange}
                maxLength={50}
                className="form-control"
              />
            </div>

            <input
              type="text"
              name="doctor_name"
              placeholder="Doctor's Name"
              value={form.doctor_name}
              onChange={handleChange}
              className="form-control mb-2"
            />
            <input
              type="date"
              name="appointment_date"
              value={form.appointment_date}
              onChange={handleChange}
              className="form-control mb-2"
            />
            <input
              type="time"
              name="appointment_time"
              value={form.appointment_time}
              onChange={handleChange}
              className="form-control mb-2"
            />

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={Submit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpcomingEvent;
