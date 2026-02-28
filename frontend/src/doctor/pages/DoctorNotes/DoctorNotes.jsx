import React, { useState } from "react";
import "./DoctorNotes.css";

function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function DoctorNotes({ selectedChild }) {
  const [form, setForm] = useState({ title: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (!selectedChild) {
    return (
      <div className="notes-empty">
        <div className="note-card">
          <i className="ri-sticky-note-line"></i>
          <h2>No Patient Selected</h2>
          <p>
            Please search and select a patient to
            <br />
            add or view doctor notes.
          </p>
        </div>
      </div>
    );
  }

  // Use real health notes from selectedChild
  const previousNotes = (selectedChild.healthNotes || []).filter(
    (n) => n.record_type === "Doctor Note"
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const numericId = parseInt(selectedChild.id.replace("CH", ""));

      const res = await fetch(
        `http://localhost:5000/children/${numericId}/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const result = await res.json();

      if (res.ok) {
        setMessage("✓ Note saved successfully.");
        setForm({ title: "", description: "" });
      } else {
        setMessage(`✗ ${result.error || "Failed to save note."}`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("✗ Cannot reach server. Is Flask running?");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="notes-page">
      <div className="notes-header">
        <div className="header-left">
          <div className="icon">📝</div>
          <div>
            <h2>Doctor Notes</h2>
            <p>Notes for: {selectedChild.name}</p>
          </div>
        </div>
      </div>

      <div className="notes-grid">
        {/* Add Note Form */}
        <div className="note-card">
          <h3 className="card-title">
            <i className="ri-add-line"></i> Add Note
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title (optional)</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Follow-up visit"
                value={form.title}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Note</label>
              <textarea
                name="description"
                placeholder="Observations, diagnosis, follow-up instructions..."
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            {message && (
              <p style={{ color: message.startsWith("✓") ? "green" : "red", fontSize: "0.85rem" }}>
                {message}
              </p>
            )}

            <button type="submit" className="primary-btn" disabled={saving}>
              <i className="ri-save-line"></i> {saving ? "Saving..." : "Save Note"}
            </button>
          </form>
        </div>

        {/* Previous Notes */}
        <div className="note-card">
          <h3 className="card-title">Previous Notes</h3>
          {previousNotes.length === 0 ? (
            <p className="muted">No doctor notes recorded yet.</p>
          ) : (
            previousNotes.map((note, index) => (
              <div key={index} className="note-item">
                <small className="muted">{formatDate(note.record_date)}</small>
                {note.title && <strong style={{ display: "block" }}>{note.title}</strong>}
                <p>{note.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}