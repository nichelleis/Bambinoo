import { useEffect, useState } from "react";
import "../../../assets/styleSheets/SearchChild.module.css";

const SearchChild = ({ selectedChild, setSelectedChild }) => {
  const [query, setQuery] = useState("");
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH FROM BACKEND
  useEffect(() => {
    fetch("http://127.0.0.1:5000/children")
      .then((res) => res.json())
      .then((data) => {
        setChildrenData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch children:", err);
        setLoading(false);
      });
  }, []);

  const filteredChildren = childrenData.filter(
    (child) =>
      child.name.toLowerCase().includes(query.toLowerCase()) ||
      child.id.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return <p style={{ padding: "24px" }}>Loading patients...</p>;
  }

  return (
    <div className="search-child-page">
      <h2 className="page-title">Search Patient</h2>

      {/* SEARCH BAR */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search by child name or ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="result-count">
          {filteredChildren.length} patient
          {filteredChildren.length !== 1 && "s"} found
        </span>
      </div>

      {/* SELECTED CHILD */}
      {selectedChild && (
        <div className="selected-child">
          <span>Currently Selected</span>
          <strong>{selectedChild.name}</strong>
          <span className="status">Active</span>
        </div>
      )}

      {/* CHILD LIST */}
      <div className="child-grid">
        {filteredChildren.map((child) => (
          <div
            key={child.id}
            className={`child-card ${
              selectedChild?.id === child.id ? "active" : ""
            }`}
            onClick={() => setSelectedChild(child)}
          >
            <h3>{child.name}</h3>
            <p>
              {child.age} years • {child.gender}
            </p>

            <div className="divider" />

            <p>
              <strong>Parent:</strong> {child.parent}
            </p>
            <p>
              <strong>Phone:</strong> {child.phone}
            </p>
            <p>
              <strong>Blood Type:</strong> {child.blood}
            </p>

            {child.allergies.length > 0 && (
              <div className="allergy-tags">
                {child.allergies.map((a) => (
                  <span key={a}>{a}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchChild;
