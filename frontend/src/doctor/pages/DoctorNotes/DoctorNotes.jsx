import React from "react";


export default function DoctorNotes({ selectedChild }) {
  if (!selectedChild) {
    return (
      <div className="notes-empty">
        <div className="empty-card">
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
 
        <div className="card">
          <h3 className="card-title">
            <i className="ri-add-line"></i> Add Note
          </h3>

          <div className="form-group">
            <label>Note</label>
            <textarea placeholder="Observations, diagnosis, follow-up instructions..." />
          </div>

          <button className="primary-btn">
            <i className="ri-save-line"></i> Save Note
          </button>
        </div>

    
        <div className="card">
          <h3 className="card-title">Previous Notes</h3>

          <div className="note-item">
            <small className="muted">01/04/2026</small>
            <p>
              Child recovering well. No fever observed.
              Continue medication for 3 more days.
            </p>
          </div>

          <div className="note-item">
            <small className="muted">12/12/2025</small>
            <p>
              Mild cough reported. Advised warm fluids and
              monitoring symptoms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
