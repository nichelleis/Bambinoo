import "./Growth.css";
import React, { useState } from "react";

export default function Growth({ selectedChild }) {
  const [form, setForm] = useState({
    date: "",
    weight: "",
    height: "",
    head: "",
    notes: "",
  });

  if (!selectedChild) {
    return (
      <div className="chdr-empty">
        <div className="empty-card">
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Growth Data Saved:", form);
  };

  return (
    <div className="growth-page">

      <div className="growth-header">
        <h2>Growth Data</h2>
        <p>Recording for: <strong>{selectedChild.name}</strong></p>
      </div>

   
      <div className="growth-grid">

        <div className="card">
          <h4>+ Add New Measurement</h4>

          <form onSubmit={handleSubmit} className="growth-form">
            <div className="row">
              <div>
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  placeholder="e.g. 12.5"
                  value={form.weight}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div>
                <label>Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  name="height"
                  placeholder="e.g. 85.0"
                  value={form.height}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Head Circumference (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  name="head"
                  placeholder="Optional"
                  value={form.head}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label>Notes</label>
            <textarea
              name="notes"
              placeholder="Any additional observations..."
              value={form.notes}
              onChange={handleChange}
            />

            <button type="submit" className="save-btn">
              Save Growth Data
            </button>
          </form>
        </div>

     
        <div className="card">
          <h4>Growth History</h4>

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
              <tr>
                <td>1/1/2024</td>
                <td>12.5 kg</td>
                <td>85 cm</td>
                <td>47 cm</td>
              </tr>
              <tr>
                <td>10/1/2023</td>
                <td>11.8 kg</td>
                <td>82 cm</td>
                <td>46 cm</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
