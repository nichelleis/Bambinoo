

import React, { useState, useEffect } from 'react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Vaccination Camp',
    date: '',
    location: '',
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = 'http://127.0.0.1:5000/api/admin';

      const [userRes, eventRes] = await Promise.all([
        fetch(`${baseUrl}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/events`)
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

  useEffect(() => { fetchData(); }, []);

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setFormData({ title: '', type: 'Vaccination Camp', date: '', location: '', description: '' });
        fetchData();
        alert("Event created!");
      }
    } catch (err) {
      alert("Connection Error.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/admin/events/${eventId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchData();
        alert('Event deleted!');
      } else {
        alert('Failed to delete event.');
      }
    } catch (err) {
      alert('Connection Error.');
    }
  };

  return (
    <div className="admin-content" style={{ padding: '20px' }}>
      

      {/* Error State */}
      {error && (
        <div style={{ padding: '15px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>
          ⚠️ Error: {error}
        </div>
      )}

      {/* Event Management Section */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>Event Management</h1>
        <div style={{ display: 'flex', gap: '30px' }}>

          {/* Left: Create Form */}
          <div className="stat-card" style={{ flex: 1.5, background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '20px' }}> Create New Event</h3>
            <form onSubmit={handleEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input style={inputStyle} type="text" placeholder="Event Title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <div style={{ display: 'flex', gap: '15px' }}>
                <select style={inputStyle} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option>Vaccination Camp</option>
                  <option>Education</option>
                  <option>Screening</option>
                </select>
                <input style={inputStyle} type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <input style={inputStyle} type="text" placeholder="Location" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              <textarea style={inputStyle} rows="3" placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              <button type="submit" style={submitBtnStyle}>Create Event & Notify Parents</button>
            </form>
          </div>

          {/* Right: Event List */}
          <div style={{ flex: 1 }}>
            <h4 style={{ color: '#64748b', fontSize: '12px', marginBottom: '15px' }}>RECENT EVENTS</h4>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                Loading event data...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '500px', overflowY: 'auto' }}>
                {events.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                    No events found.
                  </div>
                ) : (
                  events.map(event => (
                    <div key={event.id} className="stat-card" style={{ padding: '15px', border: '1px solid #f1f5f9', background: 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>{event.title}</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>{event.type}</span>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            style={{ background: 'none', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px 6px' }}
                            title="Delete"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b' }}>
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
    </div>
  );
}

// Consistent Styles
const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  outline: 'none'
};

const submitBtnStyle = {
  padding: '12px',
  background: '#0f172a',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600'
};