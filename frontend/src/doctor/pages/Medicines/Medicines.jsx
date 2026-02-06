
import "../../../assets/styleSheets/Medicines.module.css";

const Medicines = ({ selectedChild }) => {
  if (!selectedChild) {
    return (
      <div className="empty-medicine">
        <h2>No Patient Selected</h2>
        <p>Please search and select a patient first.</p>
      </div>
    );
  }

  return (
    <div className="medicine-page">
    
      <div className="medicine-header">
        <div>
          <h2>Prescribed Medicines</h2>
          <p>
            Managing for: <strong>{selectedChild.name}</strong>
          </p>
        </div>
      </div>

    
      {selectedChild.medications?.length > 0 && (
        <div className="long-term-box">
          <h4>⏱ Long-Term Critical Medicines</h4>

          {selectedChild.medications.map((med, index) => (
            <div className="long-term-item" key={index}>
              <div>
                <strong>{med.name}</strong>
                <p>{med.dosage}</p>
              </div>
              <span className="tag">Long-term</span>
            </div>
          ))}
        </div>
      )}

      <div className="medicine-layout">
        
        <div className="medicine-card">
          <h3>+ Prescribe Medicine</h3>

          <div className="form-group">
            <label>Medicine Name</label>
            <input placeholder="e.g. Amoxicillin, Ibuprofen" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Dosage</label>
              <input placeholder="e.g. 250mg, 5ml" />
            </div>
            <div className="form-group">
              <label>Frequency</label>
              <input placeholder="e.g. Twice daily" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" defaultValue="2026-01-04" />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" placeholder="mm/dd/yyyy" />
            </div>
          </div>

          <div className="toggle-row">
            <div>
              <strong>Long-term / Critical Medicine</strong>
              <p>Mark if this is an ongoing prescription</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>

          <div className="form-group">
            <label>Prescription Notes</label>
            <textarea
              rows="3"
              placeholder="Administration instructions, warnings, interactions..."
            />
          </div>

          <button className="medicine-btn">Add Prescription</button>
        </div>

     
        <div className="medicine-card">
          <h3>Prescription History</h3>

          {selectedChild.medications?.length > 0 ? (
            selectedChild.medications.map((med, index) => (
              <div className="history-item" key={index}>
                <div className="history-header">
                  <div>
                    <strong>{med.name}</strong>
                    <span className="tag">Long-term</span>
                  </div>
                </div>
                <p className="history-dosage">Dosage: {med.dosage}</p>
                <p className="history-date">Started: 9/1/2023</p>
                <small>For allergy management</small>
              </div>
            ))
          ) : (
            <p className="no-data">No prescriptions recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Medicines;