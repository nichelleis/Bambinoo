import "./NurseSearchChild.css";
import React, { useEffect, useState } from "react";
import axios from "axios";

const NurseSearchChild = ({ onSelect }) => {
  const [children, setChildren] = useState([]);
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    fetchChildren();

    // Restore previously selected child from localStorage
    const stored = localStorage.getItem("selectedChild");
    if (stored) {
      setSelectedChild(JSON.parse(stored));
    }
  }, []);

  const fetchChildren = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/children");
      setChildren(res.data);
      setFilteredChildren(res.data);
    } catch (error) {
      console.error("Error fetching children:", error);
    }
  };

  useEffect(() => {
    const filtered = children.filter(
      (child) =>
        child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChildren(filtered);
  }, [searchTerm, children]);

  const handleSelect = (child) => {
    setSelectedChild(child);
    // Persist to localStorage so the Dashboard chart can read it
    localStorage.setItem("selectedChild", JSON.stringify(child));
    if (onSelect) onSelect(child);
  };

  const handleClear = () => {
    setSelectedChild(null);
    localStorage.removeItem("selectedChild");
    if (onSelect) onSelect(null);
  };

  return (
    <div className="search-child-page">
      <h2 className="page-title">Search Child</h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by child name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <span className="result-count">
        {filteredChildren.length} child(ren) found
      </span>

      {selectedChild && (
        <div className="selected-child">
          <span>CURRENTLY SELECTED</span>
          <strong>{selectedChild.name}</strong>
          <span className="status">Active</span>
          <button
            onClick={handleClear}
            style={{
              marginLeft: "auto",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "6px",
              color: "#f1f5f9",
              cursor: "pointer",
              padding: "2px 10px",
              fontSize: "0.75rem",
            }}
          >
            Clear
          </button>
        </div>
      )}

      <div className="child-grid">
        {filteredChildren.length > 0 ? (
          filteredChildren.map((child) => (
            <div
              key={child.id}
              className={`child-card ${
                selectedChild?.id === child.id ? "active" : ""
              }`}
              onClick={() => handleSelect(child)}
            >
              <h3>{child.name}</h3>
              <p>
                {child.age} years • {child.gender}
              </p>

              <div className="divider"></div>

              <p>
                <strong>Parent:</strong> {child.parent}
              </p>
              <p>
                <strong>Email:</strong> {child.phone}
              </p>
              <p>
                <strong>Blood Type:</strong> {child.blood}
              </p>

              <div className="allergy-tags">
                {child.allergies.length > 0 ? (
                  child.allergies.map((allergy, index) => (
                    <span key={index}>{allergy}</span>
                  ))
                ) : (
                  <span>No allergies</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <h3>No child found</h3>
            <p>Try searching with a different name or ID.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseSearchChild;
