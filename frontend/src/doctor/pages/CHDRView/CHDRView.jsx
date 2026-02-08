import "./CHDRView.css";
import React from "react";

export default function CHDRView({ selectedChild }) {
 
  if (!selectedChild) {
    return (
      <div className="chdr-empty">
        <div className="empty-card">
          <i className="ri-file-list-3-line"></i>
          <h2>No Patient Selected</h2>
          <p>
            Please search and select a patient to view their
            <br />
            Child Health Development Record (CHDR).
          </p>
        </div>
      </div>
    );
  }

 
  return (
    <div className="chdr-page">
  
      <div className="chdr-header">
        <div className="child-info">
          <div className="avatar">{selectedChild.name[0]}</div>
          <div>
            <h2>{selectedChild.name}</h2>
            <p>Child Health Development Record (CHDR)</p>
          </div>
        </div>

        <button className="export-btn">Export CHDR</button>
      </div>

      <div className="chdr-stats">
        <div className="stat-card">
          <span>Date of Birth</span>
          <strong>{selectedChild.dob || "3/15/2021"}</strong>
          <small>5 years, 10 months</small>
        </div>

        <div className="stat-card">
          <span>Blood Type</span>
          <strong>{selectedChild.blood}</strong>
        </div>

        <div className="stat-card">
          <span>Allergies</span>
          <strong>{selectedChild.allergies.length}</strong>
          <small>recorded</small>
        </div>

        <div className="stat-card">
          <span>Active Conditions</span>
          <strong>1</strong>
        </div>
      </div>


      <div className="alert-box">
        <h4>Known Allergies</h4>
        <div className="tags">
          {selectedChild.allergies.map((a, i) => (
            <span key={i} className="tag danger">
              {a}
            </span>
          ))}
        </div>
      </div>


      <div className="chdr-grid">
        {/* GROWTH */}
        <div className="card">
          <h4>Latest Growth Measurements</h4>
          <div className="growth">
            <div>
              <strong>12.5</strong>
              <span>kg (Weight)</span>
            </div>
            <div>
              <strong>85</strong>
              <span>cm (Height)</span>
            </div>
            <div>
              <strong>47</strong>
              <span>cm (Head)</span>
            </div>
          </div>
          <small>Recorded on 1/1/2024</small>
        </div>


        <div className="card">
          <h4>Immunization Status</h4>
          <p>
            <strong>Total Immunizations</strong>
            <span className="count">2</span>
          </p>
          <ul>
            <li>MMR <span>6/15/2023</span></li>
            <li>DTaP <span>3/10/2023</span></li>
          </ul>
        </div>

        {/* MEDICAL HISTORY */}
        <div className="card">
          <h4>Medical History</h4>
          <p>
            <strong>Eczema</strong>
            <span className="status active">active</span>
          </p>
          <small>Diagnosed: 8/20/2022</small>
        </div>

        <div className="card">
          <h4>Active Medications</h4>
          <p>
            <strong>Cetirizine</strong>
            <span className="pill">Long-term</span>
          </p>
          <small>5ml • Once daily</small>
        </div>
      </div>
    </div>
  );
}
