import React, { useState, useEffect } from "react";
import "./DoctorNotes.css";

function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

const TYPE_STYLES = {
  "Doctor Note":  { bg: "#e8f4fd", border: "#3b82f6", badge: "#3b82f6" },
  "Prescription": { bg: "#fef3e2", border: "#f59e0b", badge: "#f59e0b" },
  "Doctor Visit": { bg: "#e8fdf5", border: "#10b981", badge: "#10b981" },
};

function getStyle(type) {
  return TYPE_STYLES[type] || { bg: "#f5f5f5", border: "#aaa", badge: "#aaa" };
}

export default function ClinicalNotes({ selectedChild }) {
  // "note" | "prescription"
  const [activeMode, setActiveMode] = useState("note");
  const [records, setRecords] = useState([]);
  const [noteForm, setNoteForm] = useState({ title: "", doctor_name: "", notes: "" });
  const [medForm, setMedForm]   = useState({
    medication_name: "", medication_dosage: "", frequency: "",
    doctor_name: "", longTerm: false, notes: "",
  });
  const [savingNote, setSavingNote] = useState(false);
  const [savingMed,  setSavingMed]  = useState(false);
  const [noteMsg, setNoteMsg] = useState("");
  const [medMsg,  setMedMsg]  = useState("");

  // Seed local records from prop whenever the selected child changes
  useEffect(() => {
    setRecords(selectedChild?.healthRecords || []);
    setNoteMsg("");
    setMedMsg("");
  }, [selectedChild]);

  if (!selectedChild) {
    return (
      <div className="cn-empty">
        <div className="cn-empty-card">
          <i className="ri-file-medical-line"></i>
          <h2>No Patient Selected</h2>
          <p>Please search and select a patient to view clinical records.</p>
        </div>
      </div>
    );
  }

  const numericId     = parseInt(selectedChild.id.replace("CH", ""));

  const doctorNotes   = records
    .filter(r => r.record_type === "Doctor Note")
    .slice().sort((a, b) => new Date(b.record_date) - new Date(a.record_date));
  const prescriptions = records
    .filter(r => r.record_type === "Prescription")
    .slice().sort((a, b) => new Date(b.record_date) - new Date(a.record_date));

  const historyRecords = activeMode === "note" ? doctorNotes : prescriptions;

  const handleNoteChange = e => setNoteForm({ ...noteForm, [e.target.name]: e.target.value });
  const handleMedChange  = e => {
    const { name, value, type, checked } = e.target;
    setMedForm({ ...medForm, [name]: type === "checkbox" ? checked : value });
  };

  const handleNoteSubmit = async e => {
    e.preventDefault();
    setSavingNote(true);
    setNoteMsg("");
    try {
      const res = await fetch(
        `http://localhost:5000/children/${numericId}/health-records/notes`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(noteForm) }
      );
      const result = await res.json();
      if (res.ok) {
        // Optimistically prepend the new record to local state
        const newRecord = {
          record_type: "Doctor Note",
          record_date: new Date().toISOString(),
          title: noteForm.title,
          doctor_name: noteForm.doctor_name,
          notes: noteForm.notes,
          ...result, // use server response if it returns the full record
        };
        setRecords(prev => [newRecord, ...prev]);
        setNoteMsg("✓ Note saved.");
        setNoteForm({ title: "", doctor_name: "", notes: "" });
      } else {
        setNoteMsg(`✗ ${result.error || "Failed."}`);
      }
    } catch { setNoteMsg("✗ Cannot reach server."); }
    finally   { setSavingNote(false); }
  };

  const handleMedSubmit = async e => {
    e.preventDefault();
    setSavingMed(true);
    setMedMsg("");
    try {
      const res = await fetch(
        `http://localhost:5000/children/${numericId}/health-records/prescriptions`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(medForm) }
      );
      const result = await res.json();
      if (res.ok) {
        // Optimistically prepend the new prescription to local state
        const newRecord = {
          record_type: "Prescription",
          record_date: new Date().toISOString(),
          medication_name: medForm.medication_name,
          medication_dosage: medForm.medication_dosage,
          frequency: medForm.frequency,
          doctor_name: medForm.doctor_name,
          notes: medForm.longTerm
            ? `Long-term. ${medForm.notes}`.trim()
            : medForm.notes,
          ...result, // use server response if it returns the full record
        };
        setRecords(prev => [newRecord, ...prev]);
        setMedMsg("✓ Prescription saved.");
        setMedForm({ medication_name: "", medication_dosage: "", frequency: "", doctor_name: "", longTerm: false, notes: "" });
      } else {
        setMedMsg(`✗ ${result.error || "Failed."}`);
      }
    } catch { setMedMsg("✗ Cannot reach server."); }
    finally   { setSavingMed(false); }
  };

  return (
    <div className="cn-page">

      <div className="cn-header">
        <div className="cn-header-left">
          <div>
            <h2>Clinical Records</h2>
            <p>Patient: <strong>{selectedChild.name}</strong></p>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="cn-mode-toggle">
        <button
          className={`cn-mode-btn ${activeMode === "note" ? "active-note" : ""}`}
          onClick={() => { setActiveMode("note"); setNoteMsg(""); setMedMsg(""); }}
        >
          <i className="ri-sticky-note-line"></i> Doctor Notes
        </button>
        <button
          className={`cn-mode-btn ${activeMode === "prescription" ? "active-rx" : ""}`}
          onClick={() => { setActiveMode("prescription"); setNoteMsg(""); setMedMsg(""); }}
        >
          <i className="ri-capsule-line"></i> Prescriptions
        </button>
      </div>

      <div className="cn-layout">

        {/* LEFT: Form — switches based on mode */}
        <div className="cn-forms">

          {activeMode === "note" && (
            <div className="cn-form-card">
              <h3><i className="ri-sticky-note-line"></i> Add Doctor Note</h3>
              <form onSubmit={handleNoteSubmit}>
                <div className="cn-field">
                  <label>Title</label>
                  <input type="text" name="title" placeholder="e.g. Follow-up visit"
                    value={noteForm.title} onChange={handleNoteChange} />
                </div>
                <div className="cn-field">
                  <label>Doctor Name</label>
                  <input type="text" name="doctor_name" placeholder="e.g. Dr. Sarah Mitchell"
                    value={noteForm.doctor_name} onChange={handleNoteChange} />
                </div>
                <div className="cn-field">
                  <label>Note *</label>
                  <textarea name="notes" rows={4}
                    placeholder="Observations, diagnosis, follow-up instructions..."
                    value={noteForm.notes} onChange={handleNoteChange} required />
                </div>
                {noteMsg && <p className={noteMsg.startsWith("✓") ? "cn-success" : "cn-error"}>{noteMsg}</p>}
                <button type="submit" className="cn-btn" disabled={savingNote}>
                  <i className="ri-save-line"></i> {savingNote ? "Saving..." : "Save Note"}
                </button>
              </form>
            </div>
          )}

          {activeMode === "prescription" && (
            <div className="cn-form-card">
              <h3><i className="ri-capsule-line"></i> Prescribe Medicine</h3>
              <form onSubmit={handleMedSubmit}>
                <div className="cn-field">
                  <label>Medicine Name *</label>
                  <input type="text" name="medication_name" placeholder="e.g. Amoxicillin"
                    value={medForm.medication_name} onChange={handleMedChange} required />
                </div>
                <div className="cn-row">
                  <div className="cn-field">
                    <label>Dosage</label>
                    <input type="text" name="medication_dosage" placeholder="e.g. 250mg"
                      value={medForm.medication_dosage} onChange={handleMedChange} />
                  </div>
                  <div className="cn-field">
                    <label>Frequency</label>
                    <input type="text" name="frequency" placeholder="e.g. Twice daily"
                      value={medForm.frequency} onChange={handleMedChange} />
                  </div>
                </div>
                <div className="cn-field">
                  <label>Doctor Name</label>
                  <input type="text" name="doctor_name" placeholder="e.g. Dr. Sarah Mitchell"
                    value={medForm.doctor_name} onChange={handleMedChange} />
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
                {medMsg && <p className={medMsg.startsWith("✓") ? "cn-success" : "cn-error"}>{medMsg}</p>}
                <button type="submit" className="cn-btn rx-btn" disabled={savingMed}>
                  <i className="ri-save-line"></i> {savingMed ? "Saving..." : "Save Prescription"}
                </button>
              </form>
            </div>
          )}

        </div>

        {/* RIGHT: History filtered by active mode */}
        <div className="cn-history">
          <div className="cn-history-header">
            <h3>
              {activeMode === "note"
                ? <><i className="ri-history-line"></i> Doctor Notes History</>
                : <><i className="ri-history-line"></i> Prescription History</>
              }
            </h3>
            <span className="cn-count">{historyRecords.length} record{historyRecords.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="cn-records">
            {historyRecords.length === 0 ? (
              <p className="cn-muted">No records found.</p>
            ) : (
              historyRecords.map((record, i) => {
                const style      = getStyle(record.record_type);
                const isLongTerm = record.notes?.toLowerCase().includes("long-term");
                const cleanNotes = record.notes?.replace("Long-term.", "").trim();

                return (
                  <div key={i} className="cn-record-card"
                    style={{ backgroundColor: style.bg, borderLeft: `4px solid ${style.border}` }}>

                    <div className="cn-record-top">
                      <span className="cn-record-type" style={{ background: style.badge }}>
                        {record.record_type}
                      </span>
                      <small className="cn-muted">{formatDate(record.record_date)}</small>
                      {isLongTerm && <span className="cn-longterm">Long-term</span>}
                    </div>

                    {record.title && <strong className="cn-record-title">{record.title}</strong>}
                    {record.doctor_name && <p className="cn-muted" style={{ fontSize: "0.8rem" }}>{record.doctor_name}</p>}

                    {record.medication_name && (
                      <div className="cn-med-row">
                        <span>{record.medication_name}</span>
                        {record.medication_dosage && <span>• {record.medication_dosage}</span>}
                        {record.treatment         && <span>• {record.treatment}</span>}
                      </div>
                    )}

                    {record.diagnosis && <p className="cn-record-text"><strong>Diagnosis:</strong> {record.diagnosis}</p>}
                    {record.treatment && !record.medication_name &&
                      <p className="cn-record-text">💉 <strong>Treatment:</strong> {record.treatment}</p>}

                    {cleanNotes && <p className="cn-record-notes">{cleanNotes}</p>}
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
