import React, { useState, useEffect } from "react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "Vaccination Camp",
    date: "",
    location: "",
    description: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const baseUrl = "http://127.0.0.1:5000/api/admin";

      const [userRes, eventRes] = await Promise.all([
        fetch(`${baseUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/events`),
      ]);

      const userData = await userRes.json();
      const eventData = await eventRes.json();

      setUsers(Array.isArray(userData) ? userData : []);
      setEvents(Array.isArray(eventData) ? eventData : []);
    } catch (err) {
      setError("Connection failed. Check if Flask is on Port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormData({
          title: "",
          type: "Vaccination Camp",
          date: "",
          location: "",
          description: "",
        });
        fetchData();
        alert("Event created!");
      }
    } catch (err) {
      alert("Connection Error.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/admin/events/${eventId}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        fetchData();
        alert("Event deleted!");
      } else {
        alert("Failed to delete event.");
      }
    } catch (err) {
      alert("Connection Error.");
    }
  };

  return (
    <div style={containerStyle}>
      {error && <div style={errorStyle}>⚠️ Error: {error}</div>}

      <h1 style={titleStyle}>Event Management Dashboard</h1>

      <div style={flexContainer}>
        <div style={cardStyle}>
          <h3 style={cardTitle}>
            <i
              class="bi bi-calendar-plus"
              style={{
                paddingRight: "6px",
                color: "rgb(60, 141, 223)",
                fontSize: "1.3rem",
              }}
            ></i>{" "}
            Create New Event
          </h3>
          <form onSubmit={handleEventSubmit} style={formStyle}>
            <input
              style={inputStyle}
              type="text"
              placeholder="Event Title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <div style={{ display: "flex", gap: "15px" }}>
              <select
                style={inputStyle}
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option>Vaccination Camp</option>
                <option>Education</option>
                <option>Screening</option>
              </select>
              <input
                style={inputStyle}
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <input
              style={inputStyle}
              type="text"
              placeholder="Location"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
            <textarea
              style={inputStyle}
              rows="3"
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <button type="submit" style={submitBtnStyle}>
              Create Event & Notify Parents
            </button>
          </form>
        </div>

        <div style={{ flex: 1 }}>
          <h4 style={recentEventsTitle}>RECENT EVENTS</h4>
          {loading ? (
            <div style={loadingStyle}>Loading event data...</div>
          ) : (
            <div style={eventsContainer}>
              {events.length === 0 ? (
                <div style={noEventsStyle}>No events found.</div>
              ) : (
                events.map((event) => (
                  <div key={event.id} style={eventCardStyle}>
                    <div style={eventCardHeader}>
                      <span style={{ fontWeight: "600", fontSize: "14px" }}>
                        {event.title}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <span style={eventTypeStyle}>{event.type}</span>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          style={deleteBtnStyle}
                          title="Delete"
                        >
                          x
                        </button>
                      </div>
                    </div>
                    <div style={eventDetailsStyle}>
                      {event.date} | 📍 {event.location}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  padding: "30px",
  fontFamily: "'DM Sans', sans-serif",
  background: "#f8fafc",
  minHeight: "100vh",
};

const errorStyle = {
  padding: "15px",
  background: "#fee2e2",
  color: "#991b1b",
  borderRadius: "8px",
  marginBottom: "20px",
  fontWeight: "500",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#0f172a",
  marginBottom: "25px",
};

const flexContainer = {
  display: "flex",
  gap: "30px",
  flexWrap: "wrap",
};

const cardStyle = {
  flex: 1.5,
  background: "white",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const cardTitle = {
  marginBottom: "20px",
  fontWeight: "600",
  fontSize: "18px",
  color: "#1e293b",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 15px",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  outline: "none",
  fontSize: "14px",
  transition: "border 0.2s",
  fontFamily: "'DM Sans', sans-serif",
};

const submitBtnStyle = {
  padding: "12px",
  background: "#0f172a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "background 0.2s",
  fontSize: "14px",
};

const recentEventsTitle = {
  color: "#475569",
  fontSize: "12px",
  marginBottom: "15px",
  fontWeight: "500",
};

const loadingStyle = {
  padding: "40px",
  textAlign: "center",
  color: "#64748b",
};

const eventsContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  maxHeight: "500px",
  overflowY: "auto",
};

const noEventsStyle = {
  padding: "30px",
  textAlign: "center",
  color: "#94a3b8",
  fontStyle: "italic",
};

const eventCardStyle = {
  padding: "15px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  background: "white",
  transition: "transform 0.2s",
  cursor: "default",
};

const eventCardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const eventTypeStyle = {
  fontSize: "11px",
  background: "#f1f5f9",
  padding: "2px 8px",
  borderRadius: "10px",
};

const deleteBtnStyle = {
  background: "none",
  color: "#94a3b8",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  padding: "2px 6px",
};

const eventDetailsStyle = {
  marginTop: "8px",
  fontSize: "12px",
  color: "#64748b",
};
