import React, { useState } from "react";
import "./ClinicalNotes.css";

function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

const RECORD_TYPE_COLORS = {
  "Doctor Note":          { bg: "#e8f4fd", border: "#3b82f6", badge: "#3b82f6" },
  "Prescription":         { bg: "#fef3e2", border: "#f59e0b", badge: "#f59e0b" },
  "Fever":                { bg: "#fde8e8", border: "#ef4444", badge: "#ef4444" },
  "Cold":                 { bg: "#e8f5e9", border: "#4caf50", badge: "#4caf50" },
  "Vaccination reaction": { bg: "#f3e8fd", border: "#9c27b0", badge: "#9c27b0" },
  "Checkup note":         { bg: "#e8fdf5", border: "#10b981", badge: "#10b981" },
};

function getStyle(type) {
  return RECORD_TYPE_COLORS[type] || { bg: "#f5f5f5", border: "#aaa", badge: "#aaa" };
}

export default function ClinicalNotes({ selectedChild }) {
  const [activeTab, setActiveTab] = useState("all");
  const [noteForm, setNoteForm] = useState({ title: "", description: "" });
  const [medForm, setMedForm] = useState({
    medicineName: "", dosage: "", frequency: "",
    startDate: "", endDate: "", longTerm: false, notes: "",
  });
  const [savingNote, setSavingNote] = useState(false);
  const [savingMed, setSavingMed] = useState(false);
  const [noteMsg, setNoteMsg] = useState("");
  const [medMsg, setMedMsg] = useState("");

  if (!selectedChild) {
    return (
      <div className="cn-empty">
        <div className="cn-empty-card">
          <i className="ri-file-medical-line"></i>
          <h2>No Patient Selected</h2>
          <p>Please search and select a patient to view clinical notes.</p>
        </div>
      </div>
    );
  }

  const numericId = parseInt(selectedChild.id.replace("CH", ""));
  const allNotes = selectedChild.healthNotes || [];

  const prescriptions = allNotes.filter(n => n.record_type === "Prescription");
  const doctorNotes   = allNotes.filter(n => n.record_type === "Doctor Note");
  const longTermMeds  = prescriptions.filter(n => n.notes && n.notes.toLowerCase().includes("long-term"));

  const filteredNotes = activeTab === "all"          ? allNotes
    : activeTab === "notes"        ? doctorNotes
    : activeTab === "prescriptions"? prescriptions
    : allNotes.filter(n => n.record_type === activeTab);

  // Sort newest first
  const sortedNotes = [...filteredNotes].sort(
    (a, b) => new Date(b.record_date) - new Date(a.record_date)
  );

  const handleNoteChange = (e) => setNoteForm({ ...noteForm, [e.target.name]: e.target.value });
  const handleMedChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMedForm({ ...medForm, [name]: type === "checkbox" ? checked : value });
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    setSavingNote(true);
    setNoteMsg("");
    try {
      const res = await fetch(`http://localhost:5000/children/${numericId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteForm),
      });
      const result = await res.json();
      if (res.ok) {
        setNoteMsg("✓ Note saved successfully.");
        setNoteForm({ title: "", description: "" });
      } else {
        setNoteMsg(`✗ ${result.error || "Failed to save."}`);
      }
    } catch {
      setNoteMsg("✗ Cannot reach server.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleMedSubmit = async (e) => {
    e.preventDefault();
    setSavingMed(true);
    setMedMsg("");
    try {
      const res = await fetch(`http://localhost:5000/children/${numericId}/medicines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(medForm),
      });
      const result = await res.json();
      if (res.ok) {
        setMedMsg("✓ Prescription saved successfully.");
        setMedForm({ medicineName: "", dosage: "", frequency: "", startDate: "", endDate: "", longTerm: false, notes: "" });
      } else {
        setMedMsg(`✗ ${result.error || "Failed to save."}`);
      }
    } catch {
      setMedMsg("✗ Cannot reach server.");
    } finally {
      setSavingMed(false);
    }
  };

  return (
    <div className="cn-page">
      <div className="cn-header">
        <div className="cn-header-left">
          <div className="cn-avatar">{selectedChild.name[0]}</div>
          <div>
            <h2>Clinical Notes</h2>
            <p>Patient: <strong>{selectedChild.name}</strong></p>
          </div>
        </div>
        <div className="cn-stats">
          <span className="cn-stat-badge">{allNotes.length} Total Records</span>
          <span className="cn-stat-badge prescription">{prescriptions.length} Prescriptions</span>
          <span className="cn-stat-badge note">{doctorNotes.length} Doctor Notes</span>
        </div>
      </div>

      {/* Long-term medicines alert */}
      {longTermMeds.length > 0 && (
        <div className="cn-alert">
          <i className="ri-alert-line"></i>
          <strong>Long-Term Medications:</strong>
          {longTermMeds.map((m, i) => (
            <span key={i} className="cn-alert-pill">
              {m.medication_name} {m.medication_dosage} — {m.reason}
            </span>
          ))}
        </div>
      )}

      <div className="cn-layout">
        {/* LEFT side shows  Forms */}
        <div className="cn-forms">

          {/* the Doctor Note Form */}
          <div className="cn-form-card">
            <h3><i className="ri-sticky-note-line"></i> Add Doctor Note</h3>
            <form onSubmit={handleNoteSubmit}>
              <div className="cn-field">
                <label>Title (optional)</label>
                <input type="text" name="title" placeholder="e.g. Follow-up visit"
                  value={noteForm.title} onChange={handleNoteChange} />
              </div>
              <div className="cn-field">
                <label>Note *</label>
                <textarea name="description" rows={4}
                  placeholder="Observations, diagnosis, follow-up instructions..."
                  value={noteForm.description} onChange={handleNoteChange} required />
              </div>
              {noteMsg && (
                <p className={noteMsg.startsWith("✓") ? "cn-success" : "cn-error"}>{noteMsg}</p>
              )}
              <button type="submit" className="cn-btn primary" disabled={savingNote}>
                <i className="ri-save-line"></i> {savingNote ? "Saving..." : "Save Note"}
              </button>
            </form>
          </div>

          {/* the Prescription Form */}
          <div className="cn-form-card">
            <h3><i className="ri-capsule-line"></i> Prescribe Medicine</h3>
            <form onSubmit={handleMedSubmit}>
              <div className="cn-field">
                <label>Medicine Name *</label>
                <input type="text" name="medicineName" placeholder="e.g. Amoxicillin"
                  value={medForm.medicineName} onChange={handleMedChange} required />
              </div>
              <div className="cn-row">
                <div className="cn-field">
                  <label>Dosage</label>
                  <input type="text" name="dosage" placeholder="e.g. 250mg"
                    value={medForm.dosage} onChange={handleMedChange} />
                </div>
                <div className="cn-field">
                  <label>Frequency</label>
                  <input type="text" name="frequency" placeholder="e.g. Twice daily"
                    value={medForm.frequency} onChange={handleMedChange} />
                </div>
              </div>
              <div className="cn-row">
                <div className="cn-field">
                  <label>Start Date</label>
                  <input type="date" name="startDate" value={medForm.startDate} onChange={handleMedChange} />
                </div>
                <div className="cn-field">
                  <label>End Date</label>
                  <input type="date" name="endDate" value={medForm.endDate} onChange={handleMedChange} />
                </div>
              </div>
              <div className="cn-checkbox">
                <input type="checkbox" name="longTerm" id="longTerm"
                  checked={medForm.longTerm} onChange={handleMedChange} />
                <label htmlFor="longTerm">
                  Long-term / Critical Medicine
                  <small>Mark if this is an ongoing prescription</small>
                </label>
              </div>
              <div className="cn-field">
                <label>Notes</label>
                <textarea name="notes" rows={3}
                  placeholder="Administration instructions, warnings..."
                  value={medForm.notes} onChange={handleMedChange} />
              </div>
              {medMsg && (
                <p className={medMsg.startsWith("✓") ? "cn-success" : "cn-error"}>{medMsg}</p>
              )}
              <button type="submit" className="cn-btn primary" disabled={savingMed}>
                <i className="ri-save-line"></i> {savingMed ? "Saving..." : "Save Prescription"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT Side Shows the History */}
        <div className="cn-history">
          <div className="cn-tabs">
            {["all", "notes", "prescriptions"].map(tab => (
              <button key={tab} className={`cn-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}>
                {tab === "all" ? "All Records" : tab === "notes" ? "Doctor Notes" : "Prescriptions"}
              </button>
            ))}
          </div>

          <div className="cn-records">
            {sortedNotes.length === 0 ? (
              <p className="cn-muted">No records found.</p>
            ) : (
              sortedNotes.map((note, i) => {
                const style = getStyle(note.record_type);
                const isLongTerm = note.notes && note.notes.toLowerCase().includes("long-term");
                return (
                  <div key={i} className="cn-record-card"
                    style={{ backgroundColor: style.bg, borderLeft: `4px solid ${style.border}` }}>
                    <div className="cn-record-top">
                      <span className="cn-record-badge" style={{ backgroundColor: style.badge }}>
                        {note.record_type}
                      </span>
                      <small className="cn-muted">{formatDate(note.record_date)}</small>
                      {isLongTerm && <span className="cn-longterm-badge">Long-term</span>}
                    </div>

                    {note.title && <strong className="cn-record-title">{note.title}</strong>}

         
                    {note.description && <p className="cn-record-text">{note.description}</p>}

                    {note.medication_name && (
                      <div className="cn-med-details">
                        <span>💊 {note.medication_name}</span>
                        {note.medication_dosage && <span>• {note.medication_dosage}</span>}
                        {note.reason && <span>• {note.reason}</span>}
                      </div>
                    )}

     
                    {note.temperature && <p className="cn-record-text">🌡 Temp: {note.temperature}°C</p>}
                    {note.severity && <p className="cn-record-text">Severity: {note.severity}</p>}

               
                    {note.notes && !isLongTerm && (
                      <p className="cn-record-notes">{note.notes}</p>
                    )}
                    {note.notes && isLongTerm && note.notes.replace("Long-term.", "").trim() && (
                      <p className="cn-record-notes">{note.notes.replace("Long-term.", "").trim()}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}