import "../../../assets/styleSheets/Growth.module.css";

const Growth = ({ selectedChild }) => {
  if (!selectedChild) {
    return (
      <div className="empty-growth">
        <h2>No Patient Selected</h2>
        <p>Please search and select a patient first.</p>
      </div>
    );
  }

  return (
    <div className="growth-page">
      
      <div className="growth-header">
        <div>
          <h2> Growth Data</h2>
          <p>Recording for: <strong>{selectedChild.name}</strong></p>
        </div>
      </div>

      <div className="growth-layout">
        
        <div className="measurement-card">
          <h3>+ Add New Measurement</h3>

          <div className="form-group">
            <label>Date</label>
            <input type="date" defaultValue="2026-07-04" />
          </div>

          <div className="form-group">
            <label>Weight (kg)</label>
            <input type="text" placeholder="e.g. 12.5" />
          </div>

          <div className="form-group">
            <label>Height (cm)</label>
            <input type="text" placeholder="e.g. 85.0" />
          </div>

          <div className="form-group">
            <label>Head Circumference (cm)</label>
            <input type="text" placeholder="Optional" />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea placeholder="Any additional observations..." rows="3" />
          </div>

          <button className="save-btn">
            Save Growth Data
          </button>
        </div>

       
        <div className="history-card">
          <h3>Growth History</h3>

          <div className="history-table">
            <div className="table-header">
              <div>Date</div>
              <div>Weight</div>
              <div>Height</div>
              <div>Head</div>
            </div>

            {selectedChild.growthHistory.map((g, i) => (
              <div className="table-row" key={i}>
                <div>{g.date}</div>
                <div>{g.weight} kg</div>
                <div>{g.height} cm</div>
                <div>{g.head} cm</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Growth;