import "./DoctorGrowth.css";
import React, { useState } from "react";

function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
}

export default function Growth({ selectedChild }) {
  const [form, setForm] = useState({
    date: "",
    weight: "",
    height: "",
    head: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (!selectedChild) {
    return (
      <div className="growth-empty">
        <div className="growth-empty-card">
          <i className="ri-line-chart-line"></i>
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

  const growthHistory = selectedChild.growthHistory || [];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const numericId = parseInt(selectedChild.id.replace("CH", ""));
      const res = await fetch(`http://localhost:5000/children/${numericId}/growth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("✓ Growth record saved successfully.");
        setForm({ date: "", weight: "", height: "", head: "", notes: "" });
      } else {
        setMessage("✗ Failed to save. Please try again.");
      }
    } catch (err) {
      console.error("Error saving growth:", err);
      setMessage("✗ Server error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="growth-page">
      <div className="growth-header">
        <h2>Growth Data</h2>
        <p>Recording for: <strong>{selectedChild.name}</strong></p>
      </div>

      <div className="growth-grid">

        {/* Add New Measurement */}
        <div className="growth-card">
          <h4>+ Add New Measurement</h4>
          <form onSubmit={handleSubmit} className="growth-form">
            <div className="growth-row">
              <div className="growth-field">
                <label>Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="growth-field">
                <label>Weight (kg)</label>
                <input type="number" step="0.1" name="weight" placeholder="e.g. 12.5" value={form.weight} onChange={handleChange} required />
              </div>
            </div>

            <div className="growth-row">
              <div className="growth-field">
                <label>Height (cm)</label>
                <input type="number" step="0.1" name="height" placeholder="e.g. 85.0" value={form.height} onChange={handleChange} required />
              </div>
              <div className="growth-field">
                <label>Head Circumference (cm)</label>
                <input type="number" step="0.1" name="head" placeholder="Optional" value={form.head} onChange={handleChange} />
              </div>
            </div>

            <div className="growth-field">
              <label>Notes</label>
              <textarea name="notes" placeholder="Any additional observations..." value={form.notes} onChange={handleChange} />
            </div>

            {message && (
              <p style={{ color: message.startsWith("✓") ? "green" : "red", fontSize: "0.85rem" }}>
                {message}
              </p>
            )}

            <button type="submit" className="growth-save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Growth Data"}
            </button>
          </form>
        </div>

        {/* Growth History */}
        <div className="growth-card">
          <h4>Growth History</h4>
          {growthHistory.length === 0 ? (
            <p className="empty-text">No growth records found.</p>
          ) : (
            <table className="growth-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Height</th>
                  <th>Head</th>
                </tr>
              </thead>
              <tbody>
                {growthHistory.map((r, i) => (
                  <tr key={i}>
                    <td>{formatDate(r.record_date)}</td>
                    <td>{r.weight ? `${r.weight} kg` : "N/A"}</td>
                    <td>{r.height ? `${r.height} cm` : "N/A"}</td>
                    <td>{r.head ? `${r.head} cm` : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}