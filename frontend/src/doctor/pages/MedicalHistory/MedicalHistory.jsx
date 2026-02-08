import React from "react";
import "./MedicalHistory.css";

export default function MedicalHistory({ selectedChild }) {
  if (!selectedChild) {
    return (
      <div className="mh-empty">
        <div className="empty-card">
          <i className="ri-heart-pulse-line"></i>
          <h2>No Patient Selected</h2>
          <p>
            Please search and select a patient to manage
            <br />
            their medical history records.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mh-page">

      <div className="mh-header">
        <div className="header-left">
          <div className="icon">❤</div>
          <div>
            <h2>Medical History</h2>
            <p>Managing records for: {selectedChild.name}</p>
          </div>
        </div>
      </div>


      <div className="mh-grid">

        <div className="card">
          <h3 className="card-title">
            <i className="ri-add-line"></i> Add Medical Condition
          </h3>

          <div className="form-group">
            <label>Condition / Diagnosis</label>
            <input
              type="text"
              placeholder="e.g. Asthma, Eczema, Allergy"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date Diagnosed</label>
              <input type="date" />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select>
                <option>Active</option>
                <option>Resolved</option>
                <option>Chronic</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Clinical Notes</label>
            <textarea placeholder="Treatment details, observations, recommendations..." />
          </div>

          <button className="primary-btn">
            <i className="ri-save-line"></i> Add to Medical History
          </button>
        </div>

       
        <div className="card">
          <h3 className="card-title">Recorded Conditions</h3>

          <div className="condition-item">
            <div className="condition-header">
              <div className="condition-name">
                <i className="ri-alert-line"></i>
                <strong>Eczema</strong>
              </div>
              <span className="status-badge active">Active</span>
            </div>

            <small className="muted">
              Diagnosed: 8/20/2022
            </small>

            <p className="condition-notes">
              Mild case, managed with moisturizer
            </p>

            <div className="condition-actions">
              <button className="outline-btn">Mark Resolved</button>
              <button className="outline-btn">Mark Chronic</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
