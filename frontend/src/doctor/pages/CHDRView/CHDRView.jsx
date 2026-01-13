import { useEffect, useState } from "react";
import "../../../assets/styleSheets/CHDRView.module.css";

const CHDRView = ({ selectedChild }) => {
  const [chdr, setChdr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedChild) return;

    setLoading(true);

    fetch(
      `http://127.0.0.1:5000/api/doctor/children/${selectedChild.id}/chdr`
    )
      .then((res) => res.json())
      .then((data) => {
        setChdr(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedChild]);

  if (!selectedChild) {
    return (
      <div className="empty-chdr">
        <h2>No Patient Selected</h2>
        <p>Please search and select a patient to view their CHDR.</p>
      </div>
    );
  }

  if (loading || !chdr) {
    return <p style={{ padding: 24 }}>Loading CHDR...</p>;
  }

  return (
    <div className="chdr-page">
      <div className="chdr-header">
        <h2>{chdr.name}</h2>
        <p>Child Health Development Record (CHDR)</p>
      </div>

      <div className="chdr-cards">
        <div className="info-card">
          <p className="card-label">Age</p>
          <p className="card-value">{chdr.age}</p>
        </div>

        <div className="info-card">
          <p className="card-label">Gender</p>
          <p className="card-value">{chdr.gender}</p>
        </div>

        <div className="info-card">
          <p className="card-label">Blood Type</p>
          <p className="card-value">{chdr.blood}</p>
        </div>

        <div className="info-card">
          <p className="card-label">Active Conditions</p>
          <p className="card-value">
            {chdr.activeConditions?.length || 0}
          </p>
        </div>
      </div>

      <div className="known-allergies">
        <h4>Known Allergies</h4>
        <div className="allergy-tags">
          {chdr.allergies?.length > 0
            ? chdr.allergies.map((a, i) => <span key={i}>{a}</span>)
            : <span>None</span>}
        </div>
      </div>

      <div className="chdr-row">
        <div className="card">
          <h4>Latest Growth Measurements</h4>

          {chdr.growth ? (
            <>
              <div className="growth-grid">
                <div>{chdr.growth.weight}<br />Weight</div>
                <div>{chdr.growth.height}<br />Height</div>
                <div>{chdr.growth.head}<br />Head</div>
              </div>
              <small>Recorded on {chdr.growth.recorded}</small>
            </>
          ) : (
            <p>No growth records available</p>
          )}
        </div>

        <div className="card">
          <h4>Immunization Status</h4>
          {chdr.immunizations?.length > 0
            ? chdr.immunizations.map((i, idx) => (
                <p key={idx}>
                  {i.name} – {i.status}
                </p>
              ))
            : <p>No immunization data</p>}
        </div>
      </div>

      <div className="chdr-row">
        <div className="card">
          <h4>Medical History</h4>
          {chdr.medicalHistory?.length > 0
            ? chdr.medicalHistory.map((m, i) => (
                <p key={i}>
                  {m.condition} <span className="status">{m.status}</span>
                </p>
              ))
            : <p>No medical history</p>}
        </div>

        <div className="card">
          <h4>Active Medications</h4>
          {chdr.medications?.length > 0
            ? chdr.medications.map((m, i) => (
                <p key={i}>
                  {m.name} – {m.dosage}
                </p>
              ))
            : <p>No active medications</p>}
        </div>
      </div>
    </div>
  );
};

export default CHDRView;
