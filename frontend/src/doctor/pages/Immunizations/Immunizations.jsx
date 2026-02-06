import '../../../assets/styleSheets/Immunizations.module.css';

const Immunizations = ({ selectedChild }) => {
  if (!selectedChild) {
    return (
      <div className="empty-immunization">
        <h2>No Patient Selected</h2>
        <p>Please search and select a patient first.</p>
      </div>
    );
  }

  return (
    <div className="immunization-page">
     
      <div className="immunization-header">
        <h3>Immunization Records</h3>
        <p>
          Recording for: <strong>{selectedChild.name}</strong>
        </p>
      </div>

      <div className="immunization-layout">
       
        <div className="card">
          <h4>➕ Record New Immunization</h4>

          <label>Vaccine Name</label>
          <input type="text" placeholder="e.g. MMR, DTaP, Polio" />

          <div className="form-row">
            <div>
              <label>Date Administered</label>
              <input type="date" />
            </div>

            <div>
              <label>Dose Number</label>
              <input type="number" placeholder="1" />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label>Batch Number</label>
              <input type="text" placeholder="Optional" />
            </div>

            <div>
              <label>Next Due Date</label>
              <input type="date" />
            </div>
          </div>

          <label>Administered By</label>
          <input type="text" placeholder="Dr. Smith" />

          <label>Notes</label>
          <textarea placeholder="Any reactions or observations..." />

          <button className="saveing-btn">Record Immunization</button>
        </div>

        <div className="card">
          <h4>Immunization History</h4>

          {selectedChild.immunizations.length === 0 && (
            <p className="empty-text">No immunization records found.</p>
          )}

          {selectedChild.immunizations.map((i, index) => (
            <div className="immunization-item" key={index}>
              <div className="item-header">
                <strong>{i.name}</strong>
                <span className="dose-badge">
                  {i.dose ? `Dose ${i.dose}` : "Completed"}
                </span>
              </div>

              <p>
                Administered: <strong>{i.date || "—"}</strong>
              </p>
              <p>By: {i.administeredBy || "Dr. Smith"}</p>

              {i.nextDue && (
                <p className="next-dose">
                  Next dose: {i.nextDue}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Immunizations;
