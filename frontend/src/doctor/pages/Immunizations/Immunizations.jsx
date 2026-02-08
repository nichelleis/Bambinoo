import React, { useState } from "react";
import "./Immunizations.css";

const Immunizations = ({ selectedChild }) => {
  const [formData, setFormData] = useState({
    vaccineName: "",
    dateAdministered: "",
    doseNumber: "",
    batchNumber: "",
    nextDueDate: "",
    administeredBy: "",
    notes: "",
  });

  const immunizationHistory = [
    {
      name: "MMR",
      date: "6/15/2023",
      doctor: "Dr. Smith",
      dose: "Dose 1",
      next: "6/15/2024",
    },
    {
      name: "DTaP",
      date: "3/10/2023",
      doctor: "Dr. Smith",
      dose: "Dose 3",
    },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Immunization data:", formData);
  };

  return (
    <div className="immunizations-page">
      
      <div className="immunization-header">
        <h2>Immunization Records</h2>
        <p>
          Recording for{" "}
          <strong>{selectedChild?.name || "Selected Child"}</strong>
        </p>
      </div>

      <div className="immunization-layout">
        
        <form className="immunization-form" onSubmit={handleSubmit}>
          <h3>+ Record New Immunization</h3>

          <label>Vaccine Name</label>
          <input
            type="text"
            name="vaccineName"
            placeholder="e.g. MMR, DTaP, Polio"
            onChange={handleChange}
          />

          <div className="form-row">
            <div>
              <label>Date Administered</label>
              <input
                type="date"
                name="dateAdministered"
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Dose Number</label>
              <input
                type="number"
                name="doseNumber"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label>Batch Number</label>
              <input
                type="text"
                name="batchNumber"
                placeholder="Optional"
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Next Due Date</label>
              <input
                type="date"
                name="nextDueDate"
                onChange={handleChange}
              />
            </div>
          </div>

          <label>Administered By</label>
          <input
            type="text"
            name="administeredBy"
            placeholder="Dr. Smith"
            onChange={handleChange}
          />

          <label>Notes</label>
          <textarea
            name="notes"
            placeholder="Any reactions or observations..."
            onChange={handleChange}
          />

          <button type="submit" className="primary-btn">
            Record Immunization
          </button>
        </form>

      
        <div className="immunization-history">
          <h3>Immunization History</h3>

          {immunizationHistory.map((item, index) => (
            <div key={index} className="history-card">
              <div className="history-left">
                <strong>{item.name}</strong>
                <p>Administered: {item.date}</p>
                <p>By: {item.doctor}</p>
                {item.next && (
                  <p className="next-dose">
                    Next dose: {item.next}
                  </p>
                )}
              </div>

              <span className="dose-badge">{item.dose}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Immunizations;
