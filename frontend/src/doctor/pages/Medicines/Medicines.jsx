import React, { useState } from "react";
import "./Medicines.css";

function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function Medicines({ selectedChild }) {
  const [formData, setFormData] = useState({
    medicineName: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    longTerm: false,
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (!selectedChild) {
    return (
      <div className="medicines-empty">
        <div className="medicinesempty-card">
          <i className="ri-capsule-line"></i>
          <h2>No Patient Selected</h2>
          <p>
            Please search and select a patient to
            <br />
            manage prescribed medicines.
          </p>
        </div>
      </div>
    );
  }

  // Pull prescriptions from real data
  const allNotes = selectedChild.healthNotes || [];
  const prescriptionHistory = allNotes.filter(
    (n) => n.record_type === "Prescription"
  );
  const longTermMedicines = prescriptionHistory.filter(
    (n) => n.notes && n.notes.toLowerCase().includes("long-term")
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const numericId = parseInt(selectedChild.id.replace("CH", ""));

      // If long-term is checked, append to notes
      const notesWithFlag = formData.longTerm
        ? `Long-term. ${formData.notes}`.trim()
        : formData.notes;

      const res = await fetch(
        `http://localhost:5000/children/${numericId}/medicines`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, notes: notesWithFlag }),
        }
      );

      const result = await res.json();

      if (res.ok) {
        setMessage("✓ Prescription saved successfully.");
        setFormData({
          medicineName: "",
          dosage: "",
          frequency: "",
          startDate: "",
          endDate: "",
          longTerm: false,
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
    <div className="medicines-page">
      <div className="medicines-header">
        <div className="child-info">
          <div className="avatar">{selectedChild.name[0]}</div>
          <div>
            <h2>Prescribed Medicines</h2>
            <p>Managing for {selectedChild.name}</p>
          </div>
        </div>
      </div>

      {/* Long-term medicines banner */}
      {longTermMedicines.length > 0 && (
        <div className="critical-box">
          <div className="critical-title">
            <i className="ri-alert-line"></i>
            <span>Long-Term Critical Medicines</span>
          </div>
          {longTermMedicines.map((med, index) => (
            <div key={index} className="critical-item">
              <div>
                <strong>{med.medication_name}</strong>
                <p>
                  {med.medication_dosage} • {med.reason}
                </p>
              </div>
              <span className="pill warning">Long-term</span>
            </div>
          ))}
        </div>
      )}

      <div className="medicines-layout">
        <form className="medicine-form" onSubmit={handleSubmit}>
          <h3>+ Prescribe Medicine</h3>

          <label>Medicine Name</label>
          <input
            type="text"
            name="medicineName"
            placeholder="e.g. Amoxicillin, Ibuprofen"
            value={formData.medicineName}
            onChange={handleChange}
            required
          />

          <div className="form-row">
            <div>
              <label>Dosage</label>
              <input
                type="text"
                name="dosage"
                placeholder="e.g. 250mg, 5ml"
                value={formData.dosage}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Frequency</label>
              <input
                type="text"
                name="frequency"
                placeholder="e.g. Twice daily"
                value={formData.frequency}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="checkbox-row">
            <label>
              <input
                type="checkbox"
                name="longTerm"
                checked={formData.longTerm}
                onChange={handleChange}
              />
              <span>
                Long-term / Critical Medicine
                <small>Mark if this is an ongoing prescription</small>
              </span>
            </label>
          </div>

          <label>Prescription Notes</label>
          <textarea
            name="notes"
            placeholder="Administration instructions, warnings, interactions..."
            value={formData.notes}
            onChange={handleChange}
          />

          {message && (
            <p style={{ color: message.startsWith("✓") ? "green" : "red", fontSize: "0.85rem" }}>
              {message}
            </p>
          )}

          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Prescription"}
          </button>
        </form>

        <div className="medicine-history">
          <h3>Prescription History</h3>
          {prescriptionHistory.length === 0 ? (
            <p className="muted">No prescriptions recorded yet.</p>
          ) : (
            prescriptionHistory.map((item, index) => (
              <div key={index} className="history-card">
                <div>
                  <strong>{item.medication_name}</strong>
                  <p>
                    Dosage: {item.medication_dosage || "N/A"} • {item.reason || "N/A"}
                  </p>
                  <p>Recorded: {formatDate(item.record_date)}</p>
                  {item.notes && <small>{item.notes}</small>}
                </div>
                {item.notes && item.notes.toLowerCase().includes("long-term") && (
                  <span className="pill warning">Long-term</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}