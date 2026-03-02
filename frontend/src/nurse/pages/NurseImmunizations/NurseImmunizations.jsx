import React, { useState, useEffect } from "react";
import "./NurseImmunizations.css";

const API_BASE = "http://localhost:5000";

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function VaccinationCard({ item }) {
  return (
    <div className="ni-vacc-card">
      <div className="ni-vacc-left">
        <strong>{item.vaccine_name}</strong>

        {item.administered_by && (
          <p>
            <span className="ni-vacc-label">By:</span>
            {item.administered_by}
          </p>
        )}

        <p>
          <span className="ni-vacc-label">Administered:</span>
          {formatDate(item.administered_date)}
        </p>

        {item.batch_number && (
          <p>
            <span className="ni-vacc-label">Batch:</span>
            {item.batch_number}
          </p>
        )}

        {item.notes && (
          <p className="ni-vacc-notes">{item.notes}</p>
        )}
      </div>

      <span className="ni-dose-badge">{item.dose_number || "—"}</span>
    </div>
  );
}

const NurseImmunizations = ({ selectedChild }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

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
      <div className="ni-empty">
        <div className="ni-empty-card">
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
    <div className="ni-page">

      {/* ── Header ── */}
      <div className="ni-header">
        <div className="ni-header-left">
          <h2>
            <i className="ri-syringe-line" />
            Immunization Records
          </h2>
          <p>Recording for: <strong>{selectedChild.name}</strong></p>
        </div>
        <div className="ni-role-badge">IMMUNIZATION · NURSE</div>
      </div>

      <div className="ni-layout">

        {/* ── Form card ── */}
        <div className="ni-card">
          <h4 className="ni-card-title">
            <i className="ri-add-circle-line" /> Record New Immunization
          </h4>
          <div className="ni-divider" />

          <form className="ni-form" onSubmit={handleSubmit}>

            <div className="ni-field">
              <label>Vaccine Name <span className="ni-required">*</span></label>
              <input
                type="text"
                name="vaccineName"
                placeholder="e.g. MMR, DTaP, Polio"
                value={formData.vaccineName}
                onChange={handleChange}
              />
            </div>

            <div className="ni-form-row">
              <div className="ni-field">
                <label>Date Administered</label>
                <input
                  type="date"
                  name="dateAdministered"
                  value={formData.dateAdministered}
                  onChange={handleChange}
                />
              </div>
              <div className="ni-field">
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

            <div className="ni-field">
              <label>Batch Number</label>
              <input
                type="text"
                name="batchNumber"
                placeholder="Optional"
                value={formData.batchNumber}
                onChange={handleChange}
              />
            </div>

            <div className="ni-field">
              <label>Administered By</label>
              <input
                type="text"
                name="administeredBy"
                placeholder="e.g. Nurse Aisha"
                value={formData.administeredBy}
                onChange={handleChange}
              />
            </div>

            <div className="ni-field">
              <label>Notes</label>
              <textarea
                name="notes"
                placeholder="Any reactions or observations..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            {error   && <p className="ni-error">{error}</p>}
            {success && <p className="ni-success">{success}</p>}

            <button type="submit" className="ni-save-btn" disabled={saving}>
              {saving ? "Saving…" : "Record Immunization"}
            </button>
          </form>
        </div>

        {/* ── History card ── */}
        <div className="ni-card">
          <h4 className="ni-card-title">
            <i className="ri-file-list-3-line" /> Immunization History
          </h4>
          <div className="ni-divider" />

          {loading ? (
            <p className="ni-empty-text">Loading…</p>
          ) : history.length === 0 ? (
            <p className="ni-empty-text">No immunization records found.</p>
          ) : (
            <div className="ni-history-list">
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

export default NurseImmunizations;
