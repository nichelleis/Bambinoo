import "../../../assets/styleSheets/CHDRView.module.css";

const CHDRView = ({ selectedChild }) => {
  if (!selectedChild) {
    return (
      <div className="empty-chdr">
        <h2>No Patient Selected</h2>
        <p>Please search and select a patient to view their CHDR.</p>
      </div>
    );
  }

  return (
    <div className="chdr-page">
      {/* HEADER */}
      <div className="chdr-header">
        <h2>{selectedChild.name}</h2>
        <p>Child Health Development Record (CHDR)</p>
      </div>

      {/* TOP 4 CARDS */}
    <div className="chdr-cards">
    <div className="info-card">
        <p className="card-label">Date of Birth</p>
        <p className="card-value">{selectedChild.dob}</p>
    </div>

    <div className="info-card">
        <p className="card-label">Blood Type</p>
        <p className="card-value">{selectedChild.blood}</p>
    </div>

    <div className="info-card">
        <p className="card-label">Allergies</p>
        <p className="card-value">
        {selectedChild.allergies.length} recorded
        </p>
    </div>

  <div className="info-card">
    <p className="card-label">Active Conditions</p>
    <p className="card-value">
      {selectedChild.activeConditions.length}
    </p>
  </div>
</div>


      {/* KNOWN ALLERGIES */}
      <div className="known-allergies">
        <h4>Known Allergies</h4>
        <div className="allergy-tags">
          {selectedChild.allergies.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>
      </div>

      {/* GROWTH + IMMUNIZATION */}
      <div className="chdr-row">
        <div className="card">
          <h4>Latest Growth Measurements</h4>
          <div className="growth-grid">
            <div>{selectedChild.growth.weight}<br />Weight</div>
            <div>{selectedChild.growth.height}<br />Height</div>
            <div>{selectedChild.growth.head}<br />Head</div>
          </div>
          <small>Recorded on {selectedChild.growth.recorded}</small>
        </div>

        <div className="card">
          <h4>Immunization Status</h4>
          {selectedChild.immunizations.map((i) => (
            <p key={i.name}>
              {i.name} – {i.status}
            </p>
          ))}
        </div>
      </div>

      {/* MEDICAL HISTORY + MEDICATIONS */}
      <div className="chdr-row">
        <div className="card">
          <h4>Medical History</h4>
          {selectedChild.medicalHistory.map((m) => (
            <p key={m.condition}>
              {m.condition} <span className="status">{m.status}</span>
            </p>
          ))}
        </div>

        <div className="card">
          <h4>Active Medications</h4>
          {selectedChild.medications.map((m) => (
            <p key={m.name}>
              {m.name} – {m.dosage}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CHDRView;
