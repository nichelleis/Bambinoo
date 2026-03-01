import React, { useState } from "react";
import "./Immunizations.css";

const Immunizations = ({ selectedChild }) => {
  const [formData, setFormData] = useState({
    vaccineName: "",
    dateAdministered: "",
    doseNumber: "",
    batchNumber: "",
    nextDueDate: "",
    administeredBy: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (!selectedChild) {
    return (
      <div className="immunization-empty">
        <div className="empty-card">
          <i className="ri-syringe-line"></i>
          <h2>No Patient Selected</h2>
          <p>
            Please search and select a patient to
            <br />
            view and record immunization details.
          </p>
        </div>
      </div>
    );
  }

  // Use real vaccination data from selectedChild
  const immunizationHistory = selectedChild.vaccinations || [];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const numericId = parseInt(selectedChild.id.replace("CH", ""));

      const res = await fetch(
        `http://localhost:5000/children/${numericId}/vaccinations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await res.json();

      if (res.ok) {
        setMessage("✓ Vaccination recorded successfully.");
        setFormData({
          vaccineName: "",
          dateAdministered: "",
          doseNumber: "",
          batchNumber: "",
          nextDueDate: "",
          administeredBy: "",
          notes: "",
        });
      } else {
        setMessage(`✗ ${result.error || "Failed to save."}`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("✗ Cannot reach server. Is Flask running?");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="immunizations-page">
      <div className="immunization-header">
        <h2>Immunization Records</h2>
        <p>
          Recording for <strong>{selectedChild.name}</strong>
        </p>
      </div>

      <div className="immunization-layout">
        <form className="immunization-form" onSubmit={handleSubmit}>
          <h3>+ Record New Immunization</h3>

          <label>Vaccine Name</label>
          <input
            type="text"
            name="vaccineName"
            placeholder="e.g. MMR, DTaP, Polio"
            value={formData.vaccineName}
            onChange={handleChange}
            required
          />

          <div className="form-row">
            <div>
              <label>Date Administered</label>
              <input
                type="date"
                name="dateAdministered"
                value={formData.dateAdministered}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Dose Number</label>
              <input
                type="text"
                name="doseNumber"
                placeholder="e.g. 1st dose"
                value={formData.doseNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label>Batch Number</label>
              <input
                type="text"
                name="batchNumber"
                placeholder="Optional"
                value={formData.batchNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Next Due Date</label>
              <input
                type="date"
                name="nextDueDate"
                value={formData.nextDueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <label>Administered By</label>
          <input
            type="text"
            name="administeredBy"
            placeholder="Dr. Smith"
            value={formData.administeredBy}
            onChange={handleChange}
          />

          <label>Notes</label>
          <textarea
            name="notes"
            placeholder="Any reactions or observations..."
            value={formData.notes}
            onChange={handleChange}
          />

          {message && (
            <p style={{ color: message.startsWith("✓") ? "green" : "red", fontSize: "0.85rem" }}>
              {message}
            </p>
          )}

          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : "Record Immunization"}
          </button>
        </form>

        <div className="immunization-history">
          <h3>Immunization History</h3>

          {immunizationHistory.length === 0 ? (
            <p className="empty-text">No immunization records found.</p>
          ) : (
            immunizationHistory.map((item, index) => (
              <div key={index} className="history-card">
                <div className="history-left">
                  <strong>{item.vaccine_name}</strong>
                  <p>Administered: {item.administered_date || "N/A"}</p>
                  <p>By: {item.administered_by || "N/A"}</p>
                  {item.due_date && (
                    <p className="next-dose">Next due: {item.due_date}</p>
                  )}
                </div>
                <span className="dose-badge">{item.dose_number || "—"}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Immunizations;