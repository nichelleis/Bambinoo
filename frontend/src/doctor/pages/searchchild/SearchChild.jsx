import { useEffect, useState } from "react";

const SearchChild = ({ selectedChild, setSelectedChild }) => {
  const [query, setQuery] = useState("");
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/doctor/children")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setChildrenData(data);
        } else {
          setError("No patients found");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Backend not reachable");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p style={{ padding: 24 }}>Loading patients...</p>;
  }

  if (error) {
    return <p style={{ padding: 24, color: "red" }}>{error}</p>;
  }

  const filteredChildren = childrenData.filter(
    (child) =>
      child.name?.toLowerCase().includes(query.toLowerCase()) ||
      child.id?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: 24 }}>
      <h2>Search Patient</h2>

      <input
        style={{ padding: 10, width: "100%", marginBottom: 16 }}
        type="text"
        placeholder="Search by child name or ID..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {selectedChild && (
        <div style={{ marginBottom: 16 }}>
          <strong>Selected:</strong> {selectedChild.name}
        </div>
      )}

      {filteredChildren.map((child) => (
        <div
          key={child.id}
          style={{
            border: "1px solid #ccc",
            padding: 16,
            marginBottom: 12,
            cursor: "pointer",
            background:
              selectedChild?.id === child.id ? "#eef2ff" : "white",
          }}
          onClick={() => setSelectedChild(child)}
        >
          <h3>{child.name}</h3>
          <p>
            {child.age} years • {child.gender}
          </p>
          <p>Parent: {child.parent}</p>
          <p>Phone: {child.phone}</p>
        </div>
      ))}
    </div>
  );
};

export default SearchChild;
