import "../../../assets/styleSheets/MedicalHistory.module.css";

const MedicalHistory = ({ selectedChild }) => {
  if (!selectedChild) {
    return (
      <div className="empty-medical">
        <h2>No Patient Selected</h2>
        <p>Please search and select a patient first.</p>
      </div>
    );
  }

  return (
    <div className="medical-page">
    
      <div className="medical-header">
        <div>
          <h2>Medical History</h2>
          <p>
            Managing records for:{" "}
            <strong>{selectedChild.name}</strong>
          </p>
        </div>
      </div>

      <div className="medical-layout">
        
        <div className="medical-card">
          <h3>+ Add Medical Condition</h3>

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
            <textarea
              rows="3"
              placeholder="Treatment details, observations, recommendations..."
            />
          </div>

          <button className="medical-btn">
            Add to Medical History
          </button>
        </div>

        
        <div className="medical-card">
          <h3>Recorded Conditions</h3>

          {selectedChild.medicalHistory?.length > 0 ? (
            selectedChild.medicalHistory.map((item, index) => (
              <div className="condition-item" key={index}>
                <div className="condition-header">
                  <h4>{item.condition}</h4>
                  <span className={`status ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>

                <p className="condition-date">
                  Diagnosed: {item.date}
                </p>

                <p className="condition-notes">
                  {item.notes}
                </p>

                <div className="condition-actions">
                  <button>Mark Resolved</button>
                  <button>Mark Chronic</button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No medical conditions recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory;
