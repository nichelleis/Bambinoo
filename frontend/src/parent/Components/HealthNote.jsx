import style from "../../assets/styleSheets/ParentDashboard.module.css";
import { useState } from "react";

function HealthNote() {
  const getNow = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };
  const [showModal, setShowModal] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [noticedAt, setNoticedAt] = useState(getNow());

  const openModal = (form) => {
    setActiveForm(form);
    setNoticedAt(getNow());
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveForm(null);
  };

  return (
    <div className={`card ${style.dashboardCard}`}>
      <div className={style.cardHeaderCustom}>
        <div className={`mb-3 ${style.cardTitle}`}>
          <span className={`${style.cardIcon} ${style.iconRed}`}>
            <i className="bi bi-exclamation-octagon-fill"></i>
          </span>
          Quick Health Record
        </div>
      </div>

      <div
        className="text-center mb-3"
        style={{
          fontSize: "14px",
          color: "var(--text-muted)",
          cursor: "pointer",
        }}
      >
        Click a section to record health data
      </div>

      <div className={style.healthWheel}>
        <div
          className={`${style.quadrant} ${style.temp}`}
          onClick={() => openModal("temperature")}
        >
          <i className="bi bi-thermometer-half"></i>
          <span>Temperature</span>
        </div>

        <div
          className={`${style.quadrant} ${style.meds}`}
          onClick={() => openModal("medication")}
        >
          <i className="bi bi-capsule"></i>
          <span>Medication</span>
        </div>

        <div
          className={`${style.quadrant} ${style.symptoms}`}
          onClick={() => openModal("symptoms")}
        >
          <i className="bi bi-activity"></i>
          <span className={style.symptomsSpan}>Symptoms</span>
        </div>

        <div
          className={`${style.quadrant} ${style.notes}`}
          onClick={() => openModal("note")}
        >
          <i className="bi bi-journal-text"></i>
          <span>Notes</span>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-card p-4">
            {activeForm === "symptoms" && (
              <div className="record-form">
                <h4>Record Symptoms</h4>
                <hr />
                <label>Symptom Type</label>
                <input type="text" placeholder="e.g./- Rash, Cough, Fever" />
                <label>Severity</label>
                <select name="severity" id="severity">
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
                <label>Description</label>
                <textarea
                  rows="4"
                  placeholder="Describe the symptoms in detail..."
                ></textarea>
                <label>Date & Time Noticed</label>
                <input
                  type="datetime-local"
                  value={noticedAt}
                  onChange={(e) => setNoticedAt(e.target.value)}
                />

                <button className="btn-primary-custom">
                  <i className="bi bi-save p-2"></i>Save Weight
                </button>
              </div>
            )}

            {activeForm === "medication" && (
              <div className="record-form">
                <h4>Record Medication</h4>
                <hr />
                <label>Medication Name</label>
                <input type="text" placeholder="e.g./- Paracetamol" />

                <label>Dosage</label>
                <input type="text" placeholder="e.g./- 5ml twice daily" />

                <label>Reason</label>
                <input type="text" placeholder="e.g./- Fever" />

                <label>Date & Time Given</label>
                <input
                  type="datetime-local"
                  value={noticedAt}
                  onChange={(e) => setNoticedAt(e.target.value)}
                />

                <button className="btn-primary-custom">
                  <i className="bi bi-save p-2"></i>Save Medication
                </button>
              </div>
            )}

            {activeForm === "temperature" && (
              <div className="record-form">
                <h4>Record Temperature</h4>
                <hr />
                <label>Temperature (°C)</label>
                <input type="number" step="0.1" placeholder="e.g./- 37.5" />

                <label>Date & Time Recorded</label>
                <input
                  type="datetime-local"
                  value={noticedAt}
                  onChange={(e) => setNoticedAt(e.target.value)}
                />

                <label>Notes (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="Any symptoms or observations..."
                ></textarea>

                <button className="btn-primary-custom">
                  <i className="bi bi-save p-2"></i>Save Temperature
                </button>
              </div>
            )}

            {activeForm === "note" && (
              <div className="record-form">
                <h4>Add Health Note</h4>
                <hr />

                <label>Subject</label>
                <input
                  type="text"
                  placeholder="e.g./- Sleep pattern, Behavior change"
                />

                <label>Details</label>
                <textarea
                  rows="4"
                  placeholder="Write your observations or notes here..."
                ></textarea>

                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  value={noticedAt}
                  onChange={(e) => setNoticedAt(e.target.value)}
                />

                <button className="btn-primary-custom">
                  <i className="bi bi-save p-2"></i>Save Note
                </button>
              </div>
            )}
            <button
              className="record-close-btn btn btn-secondary"
              onClick={closeModal}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthNote;
