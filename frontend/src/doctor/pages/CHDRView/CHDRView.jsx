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
    </div>
    
  );
}
