import React, { useState } from "react";
import "./Medicines.css";

export default function Medicines({ selectedChild }) {
  const [formData, setFormData] = useState({
    medicineName: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    longTerm: false,
    notes: "",
  });

  const longTermMedicines = [
    {
      name: "Cetirizine",
      dosage: "5ml",
      frequency: "Once daily",
    },
  ];

  const prescriptionHistory = [
    {
      name: "Cetirizine",
      dosage: "5ml",
      frequency: "Once daily",
      start: "9/1/2023",
      notes: "For allergy management",
      longTerm: true,
    },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Prescription saved:", formData);
  };


  if (!selectedChild) {
    return (
      <div className="medicines-empty">
        <div className="empty-card">
          <i className="ri-capsule-line"></i>
          <h2>No Patient Selected</h2>
          <p>
            Please search and select a patient to
            <br />
            manage prescribed medicines.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="medicines-page">
      {/* HEADER */}
      <div className="medicines-header">
        <div className="child-info">
          <div className="avatar">{selectedChild.name[0]}</div>
          <div>
            <h2>Prescribed Medicines</h2>
            <p>Managing for {selectedChild.name}</p>
          </div>
        </div>
      </div>


      <div className="critical-box">
        <div className="critical-title">
          <i className="ri-alert-line"></i>
          <span>Long-Term Critical Medicines</span>
        </div>

        {longTermMedicines.map((med, index) => (
          <div key={index} className="critical-item">
            <div>
              <strong>{med.name}</strong>
              <p>
                {med.dosage} • {med.frequency}
              </p>
            </div>
            <span className="pill warning">Long-term</span>
          </div>
        ))}
      </div>


      <div className="medicines-layout">

        <form className="medicine-form" onSubmit={handleSubmit}>
          <h3>+ Prescribe Medicine</h3>

          <label>Medicine Name</label>
          <input
            type="text"
            name="medicineName"
            placeholder="e.g. Amoxicillin, Ibuprofen"
            onChange={handleChange}
          />

          <div className="form-row">
            <div>
              <label>Dosage</label>
              <input
                type="text"
                name="dosage"
                placeholder="e.g. 250mg, 5ml"
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Frequency</label>
              <input
                type="text"
                name="frequency"
                placeholder="e.g. Twice daily"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                onChange={handleChange}
              />
            </div>

            <div>
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="checkbox-row">
            <label>
              <input
                type="checkbox"
                name="longTerm"
                onChange={handleChange}
              />
              <span>
                Long-term / Critical Medicine
                <small>Mark if this is an ongoing prescription</small>
              </span>
            </label>
          </div>

          <label>Prescription Notes</label>
          <textarea
            name="notes"
            placeholder="Administration instructions, warnings, interactions..."
            onChange={handleChange}
          />

          <button type="submit" className="primary-btn">
            Save Prescription
          </button>
        </form>

  
        <div className="medicine-history">
          <h3>Prescription History</h3>

          {prescriptionHistory.map((item, index) => (
            <div key={index} className="history-card">
              <div>
                <strong>{item.name}</strong>
                <p>
                  Dosage: {item.dosage} • {item.frequency}
                </p>
                <p>Started: {item.start}</p>
                <small>{item.notes}</small>
              </div>

              {item.longTerm && (
                <span className="pill warning">Long-term</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
