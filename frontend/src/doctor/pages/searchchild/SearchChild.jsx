import "./SearchChild.css";
import React, { useEffect, useState } from "react";
import axios from "axios";

const SearchChild = ({ onSelect }) => {
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
      const res = await axios.get(
        "https://stark-harbor-79359-9d7adf515fd1.herokuapp.com/children",
      );
      setChildren(res.data);
      setFilteredChildren(res.data);
    } catch (error) {
      console.error("Error fetching children:", error);
    }
  };

  useEffect(() => {
    const filtered = children.filter((child) => {
      const term = searchTerm.toLowerCase();

      return (
        child.name.toLowerCase().includes(term) ||
        child.moh_id?.toLowerCase().includes(term)
      );
    });
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
        {filteredChildren.length} children found
      </span>

      {selectedChild && (
        <div className="selected-child">
          <span>CURRENTLY SELECTED</span>
          <strong>{selectedChild.name}</strong>
          <span className="status">
            <span className="status-dot"></span>
            Active
          </span>
          <button
            onClick={handleClear}
            style={{
              marginLeft: "auto",
              background: "rgb(235, 166, 166)",
              border: "none",
              borderRadius: "6px",
              color: "#c72c2c",
              cursor: "pointer",
              padding: "3px 12px",
              fontSize: "0.8rem",
              fontWeight: "500",
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
                <strong>ID:</strong> {child.moh_id}
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

export default SearchChild;
