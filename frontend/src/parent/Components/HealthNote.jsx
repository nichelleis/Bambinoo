import style from "../../assets/styleSheets/ParentDashboard.module.css";
import { useState, useEffect } from "react";

function HealthNote() {
  const getNow = () => new Date().toISOString().slice(0, 16);

  const initialFormState = {
    noticedAt: getNow(),
    symptomType: "",
    severity: "mild",
    description: "",
    medicationName: "",
    dosage: "",
    reason: "",
    temperature: "",
    subject: "",
    details: "",
  };

  const [showModal, setShowModal] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      noticedAt: getNow(),
    });
  };

  const openModal = (form) => {
    setActiveForm(form);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveForm(null);
    resetForm();
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/add-health-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: activeForm,
          ...formData,
        }),
      });

      if (response.ok) {
        alert(
          `${activeForm.charAt(0).toUpperCase() + activeForm.slice(1)} recorded!`,
        );
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to save record"}`);
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Could not connect to the server.");
    }
  };

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [showModal]);

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
        <div className={style.modalBackdropCustom}>
          <div className={`${style.modalCard} p-4`}>
            {activeForm === "symptoms" && (
              <div className={style.recordForm}>
                <h4>Record Symptoms</h4>
                <hr />
                <label>Symptom Type</label>
                <input
                  type="text"
                  name="symptomType"
                  value={formData.symptomType}
                  onChange={handleInputChange}
                  placeholder="e.g. Rash, Cough"
                />
                <label>Severity</label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Details..."
                />
                <label>Date & Time Noticed</label>
                <input
                  type="datetime-local"
                  name="noticedAt"
                  value={formData.noticedAt}
                  onChange={handleInputChange}
                />
                <button
                  className={style.btnPrimaryCustom}
                  onClick={handleSubmit}
                >
                  <i className="bi bi-save p-2"></i>Save Symptom
                </button>
              </div>
            )}

            {activeForm === "medication" && (
              <div className={style.recordForm}>
                <h4>Record Medication</h4>
                <hr />
                <label>Medication Name</label>
                <input
                  type="text"
                  name="medicationName"
                  value={formData.medicationName}
                  onChange={handleInputChange}
                  placeholder="e.g. Paracetamol"
                />
                <label>Dosage</label>
                <input
                  type="text"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  placeholder="e.g. 5ml"
                />
                <label>Reason</label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="e.g. Fever"
                />
                <label>Date & Time Given</label>
                <input
                  type="datetime-local"
                  name="noticedAt"
                  value={formData.noticedAt}
                  onChange={handleInputChange}
                />
                <button
                  className={style.btnPrimaryCustom}
                  onClick={handleSubmit}
                >
                  <i className="bi bi-save p-2"></i>Save Medication
                </button>
              </div>
            )}

            {activeForm === "temperature" && (
              <div className={style.recordForm}>
                <h4>Record Temperature</h4>
                <hr />
                <label>Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  placeholder="37.5"
                />
                <label>Date & Time Recorded</label>
                <input
                  type="datetime-local"
                  name="noticedAt"
                  value={formData.noticedAt}
                  onChange={handleInputChange}
                />
                <label>Notes (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Observations..."
                />
                <button
                  className={style.btnPrimaryCustom}
                  onClick={handleSubmit}
                >
                  <i className="bi bi-save p-2"></i>Save Temperature
                </button>
              </div>
            )}

            {activeForm === "note" && (
              <div className={style.recordForm}>
                <h4>Add Health Note</h4>
                <hr />
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="e.g. Sleep pattern"
                />
                <label>Details</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Write observations here..."
                />
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  name="noticedAt"
                  value={formData.noticedAt}
                  onChange={handleInputChange}
                />
                <button
                  className={style.btnPrimaryCustom}
                  onClick={handleSubmit}
                >
                  <i className="bi bi-save p-2"></i>Save Note
                </button>
              </div>
            )}

            <button
              className={`${style.recordCloseBtn} btn btn-secondary`}
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
