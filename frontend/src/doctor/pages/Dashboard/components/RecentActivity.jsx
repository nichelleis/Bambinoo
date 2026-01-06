import "./RecentActivity.css";

const RecentActivity = () => {
  return (
    <div className="activity-card">
      <h4>Recent Activity</h4>

      <ul>
        <li>
          <span className="dot"></span>
          <div>
            Growth Data Added
            <h5>John Doe – Height: 120 cm, Weight: 22 kg, BMI: 15.3</h5>
          </div>
        </li>

        <li>
          <span className="dot"></span>
          <div>
            Medical History Updated
            <h5>Jane Smith – Added allergy: Penicillin</h5>
          </div>
        </li>

        <li>
          <span className="dot"></span>
          <div>
            Immunization Record Added
            <h5>Mark Lee – Vaccine: MMR, Dose: 2nd</h5>
          </div>
        </li>

        <li>
          <span className="dot"></span>
          <div>
            Clinical Record Added
            <h5>Alice Brown – Symptoms: Fever & cough, Prescribed: Paracetamol</h5>
          </div>
        </li>

        <li>
          <span className="dot"></span>
          <div>
            Patient Authenticated
            <h5>Emily White – Verified ID via OTP</h5>
          </div>
        </li>

        <li>
          <span className="dot"></span>
          <div>
            Growth Data Added
            <h5>Michael Green – Height: 135 cm, Weight: 30 kg, BMI: 16.5</h5>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default RecentActivity;
