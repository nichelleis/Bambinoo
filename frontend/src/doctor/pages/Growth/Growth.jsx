import "./DoctorGrowth.css";
import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000";

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function GrowthRow({ record, isNew }) {
  return (
    <tr className={isNew ? "row--new" : ""}>
      <td>{formatDate(record.record_date)}</td>
      <td>{record.weight ? `${record.weight} kg` : "N/A"}</td>
      <td>{record.height ? `${record.height} cm` : "N/A"}</td>
      <td>{record.head ? `${record.head} cm` : "N/A"}</td>
      {record.notes && <td className="notes-cell">{record.notes}</td>}
      {!record.notes && <td className="notes-cell">—</td>}
    </tr>
  );
}

export default function Growth({ selectedChild }) {
  const [history, setHistory] = useState([]);
  const [newId, setNewId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emptyForm = { date: "", weight: "", height: "", head: "", notes: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!selectedChild) return;

    if (selectedChild.growthHistory) {
      setHistory(selectedChild.growthHistory);
      return;
    }

    const numericId = parseInt(String(selectedChild.id).replace("CH", ""), 10);
    fetch(`${API_BASE}/children/${numericId}/growth`)
      .then((r) => r.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]));
  }, [selectedChild]);

  if (!selectedChild) {
    return (
      <div className="growth-empty">
        <div className="growth-empty-card">
          <i className="ri-line-chart-line" />
          <h2>No Patient Selected</h2>
          <p>
            Please search and select a patient to view
            <br />
            Growth Data records.
          </p>
        </div>
      </div>
    );
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    setSaving(true);
    const numericId = parseInt(String(selectedChild.id).replace("CH", ""), 10);

    try {
      const res = await fetch(`${API_BASE}/children/${numericId}/growth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to save. Please try again.");
        return;
      }

      const newRecord = {
        id: result.id,
        record_date: form.date,
        weight: form.weight,
        height: form.height,
        head: form.head,
        notes: form.notes,
      };

      setHistory((prev) => [newRecord, ...prev]);
      setNewId(newRecord.id ?? 0);
      setTimeout(() => setNewId(null), 3000);

      setForm(emptyForm);
      setSuccess("Growth record saved successfully!");
      setTimeout(() => setSuccess(""), 3500);
    } catch {
      setError("Cannot reach server. Is Flask running?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="growth-page">
      <div className="growth-header">
        <h2>Growth Data</h2>
        <p>
          Recording for: <strong>{selectedChild.name}</strong>
        </p>
      </div>

      <div className="growth-grid">
        <div className="growth-card">
          <h4>Add New Measurement</h4>
          <form className="growth-form" onSubmit={handleSubmit}>
            <div className="growth-row">
              <div className="growth-field">
                <label htmlFor="data">
                  Date <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  id="data"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="growth-field">
                <label htmlFor="weight">
                  Weight (kg) <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  name="weight"
                  placeholder="e.g. 12.5"
                  value={form.weight}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="growth-row">
              <div className="growth-field">
                <label htmlFor="height">
                  Height (cm) <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  id="height"
                  type="number"
                  step="0.1"
                  name="height"
                  placeholder="e.g. 85.0"
                  value={form.height}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="growth-field">
                <label htmlFor="head">Head Circumference (cm)</label>
                <input
                  id="head"
                  type="number"
                  step="0.1"
                  name="head"
                  placeholder="Optional"
                  value={form.head}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="growth-field">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Any additional observations..."
                value={form.notes}
                onChange={handleChange}
              />
            </div>

            {error && <p className="form-error">{error}</p>}
            {success && <p className="form-success">{success}</p>}

            <button type="submit" className="growth-save-btn" disabled={saving}>
              {saving ? "Saving…" : "Save Growth Data"}
            </button>
          </form>
        </div>

        <div className="growth-card">
          <h4>Growth History</h4>
          {history.length === 0 ? (
            <p className="empty-text">No growth records found.</p>
          ) : (
            <div className="growth-table-wrapper">
              <table className="growth-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Weight</th>
                    <th>Height</th>
                    <th>Head</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((r, i) => (
                    <GrowthRow
                      key={r.id ?? i}
                      record={r}
                      isNew={r.id != null && r.id === newId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
