import React, { useState, useEffect } from "react";
import "./Immunizations.css";

const API_BASE = "http://localhost:5000";

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function VaccinationCard({ item }) {
  return (
    <div className="history-card">
      <div className="history-left">
        <strong>{item.vaccine_name}</strong>
        {item.administered_by && (
          <p><span className="label">By:</span>{item.administered_by}</p>
        )}
        <p><span className="label">Administered:</span>{formatDate(item.administered_date)}</p>
        {item.batch_number && (
          <p><span className="label">Batch:</span>{item.batch_number}</p>
        )}
        {item.notes && (
          <p className="notes-text">{item.notes}</p>
        )}
      </div>
      <span className="dose-badge">{item.dose_number || "—"}</span>
    </div>
  );
}

const Immunizations = ({ selectedChild }) => {
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const emptyForm = {
    vaccineName:      "",
    dateAdministered: "",
    doseNumber:       "",
    batchNumber:      "",
    administeredBy:   "",
    notes:            "",
  };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!selectedChild) return;

    if (selectedChild.vaccinations) {
      setHistory(selectedChild.vaccinations);
      return;
    }

    const numericId = parseInt(String(selectedChild.id).replace("CH", ""), 10);
    setLoading(true);
    fetch(`${API_BASE}/children/${numericId}/vaccinations`)
      .then(r => r.json())
      .then(data => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [selectedChild]);

  if (!selectedChild) {
    return (
      <div className="immunization-empty">
        <div className="empty-card">
          <i className="ri-syringe-line" />
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

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!formData.vaccineName.trim()) {
      setError("Vaccine name is required.");
      return;
    }

    setSaving(true);
    const numericId = parseInt(String(selectedChild.id).replace("CH", ""), 10);

    try {
      const res = await fetch(`${API_BASE}/children/${numericId}/vaccinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to save vaccination.");
        return;
      }

      const newRecord = {
        id:                result.id,
        vaccine_name:      formData.vaccineName,
        administered_date: formData.dateAdministered,
        dose_number:       formData.doseNumber,
        batch_number:      formData.batchNumber,
        administered_by:   formData.administeredBy,
        notes:             formData.notes,
      };
      setHistory(prev => [newRecord, ...prev]);

      setFormData(emptyForm);
      setSuccess("Vaccination recorded successfully!");
      setTimeout(() => setSuccess(""), 3500);
    } catch {
      setError("Cannot reach server. Is Flask running?");
    } finally {
      setSaving(false);
    }
  }

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
          <h3>Record New Immunization</h3>

          <div>
            <label>Vaccine Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input
              type="text"
              name="vaccineName"
              placeholder="e.g. MMR, DTaP, Polio"
              value={formData.vaccineName}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div>
              <label>Date Administered</label>
              <input
                type="date"
                name="dateAdministered"
                value={formData.dateAdministered}
                onChange={handleChange}
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
            <label>Administered By</label>
            <input
              type="text"
              name="administeredBy"
              placeholder="e.g. Dr. Sarah Mitchell"
              value={formData.administeredBy}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Notes</label>
            <textarea
              name="notes"
              placeholder="Any reactions or observations..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {error   && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving…" : "Record Immunization"}
          </button>
        </form>

        <div className="immunization-history">
          <h3>Immunization History</h3>

          {loading ? (
            <p className="empty-text">Loading…</p>
          ) : history.length === 0 ? (
            <p className="empty-text">No immunization records found.</p>
          ) : (
            <div className="history-list">
              {history.map((item, index) => (
                <VaccinationCard key={item.id ?? index} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Immunizations;
