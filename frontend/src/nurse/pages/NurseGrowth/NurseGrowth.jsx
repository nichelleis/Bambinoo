import "./NurseGrowth.css";
import React, { useState, useEffect } from "react";

const API_BASE = "https://stark-harbor-79359-9d7adf515fd1.herokuapp.com";

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
      <td className="ng-notes-cell">{record.notes || "—"}</td>
    </tr>
  );
}

export default function NurseGrowth({ selectedChild }) {
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
      <div className="ng-empty">
        <div className="ng-empty-card">
          <i className="ri-seedling-line" />
          <h2>No Patient Selected</h2>
          <p>
            Please search and select a patient to view
            <br />
            their Growth Data records.
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
    <div className="ng-page">
      {/* ── Header ── */}
      <div className="ng-header">
        <div className="ng-header-left">
          <h2>
            <i className="ri-seedling-line" />
            Growth Monitoring
          </h2>
          <p>
            Recording for: <strong>{selectedChild.name}</strong>
          </p>
        </div>
        <div className="ng-role-badge">GROWTH · NURSE</div>
      </div>

      <div className="ng-grid">
        {/* ── Form card ── */}
        <div className="ng-card">
          <h4 className="ng-card-title">
            <i className="ri-add-circle-line" /> Add New Measurement
          </h4>
          <div className="ng-divider" />

          <form className="ng-form" onSubmit={handleSubmit}>
            <div className="ng-form-row">
              <div className="ng-field">
                <label>
                  Date <span className="ng-required">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="ng-field">
                <label>
                  Weight (kg) <span className="ng-required">*</span>
                </label>
                <input
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

            <div className="ng-form-row">
              <div className="ng-field">
                <label>
                  Height (cm) <span className="ng-required">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="height"
                  placeholder="e.g. 85.0"
                  value={form.height}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="ng-field">
                <label>Head Circumference (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  name="head"
                  placeholder="Optional"
                  value={form.head}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="ng-field">
              <label>Notes</label>
              <textarea
                name="notes"
                placeholder="Any additional observations..."
                value={form.notes}
                onChange={handleChange}
              />
            </div>

            {error && <p className="ng-error">{error}</p>}
            {success && <p className="ng-success">{success}</p>}

            <button type="submit" className="ng-save-btn" disabled={saving}>
              {saving ? "Saving…" : "Save Growth Record"}
            </button>
          </form>
        </div>

        {/* ── History card ── */}
        <div className="ng-card">
          <h4 className="ng-card-title">
            <i className="ri-bar-chart-grouped-line" /> Growth History
          </h4>
          <div className="ng-divider" />

          {history.length === 0 ? (
            <p className="ng-empty-text">No growth records found.</p>
          ) : (
            <div className="ng-table-wrapper">
              <table className="ng-table">
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
