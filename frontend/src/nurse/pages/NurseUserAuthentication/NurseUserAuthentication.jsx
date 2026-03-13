import React, { useState, useEffect, useCallback } from "react";
import "./NurseUserAuthentication.css";

const NurseUserAuthentication = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [currentDeclineId, setCurrentDeclineId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/search_registration/${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const result = await response.json();
        setSearchResult(result);
        setSelectedRecord(result.data);
        setShowDetails(true);
      } else {
        alert("No record found with that registration number.");
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const token = localStorage.getItem("token");

  // Fetch pending registrations when component mounts
  const fetchPendingRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error("Authentication token missing. Please log in.");
      }

      const response = await fetch(
        "http://127.0.0.1:5000/pending_registrations",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        // try to extract error message from body
        let errText;
        try {
          const json = await response.json();
          errText = json.message || JSON.stringify(json);
        } catch {
          errText = await response.text();
        }
        throw new Error(
          errText ||
            `Failed to fetch pending registrations (${response.status})`,
        );
      }

      const data = await response.json();
      setPendingRegistrations(data);
    } catch (error) {
      setMessage(error.message || "Unknown error");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPendingRegistrations();
  }, [fetchPendingRegistrations]);

  const handleApprove = async (registrationId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/pending_registrations/approve/${registrationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        let errTxt;
        try {
          const j = await response.json();
          errTxt = j.message || JSON.stringify(j);
        } catch {
          errTxt = await response.text();
        }
        throw new Error(
          errTxt || `Failed to approve registration (${response.status})`,
        );
      }

      setMessage("Registration approved successfully!");
      setMessageType("success");
      setShowDetails(false);
      fetchPendingRegistrations();
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    }
  };

  const handleDeclineClick = (id) => {
    setCurrentDeclineId(id);
    setShowDeclineModal(true);
  };

  const confirmDecline = async () => {
    if (!declineReason.trim()) {
      alert("Reason is required to decline.");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/pending_registrations/decline/${currentDeclineId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: declineReason.trim() }),
        },
      );

      if (!response.ok) {
        let errTxt;
        try {
          const j = await response.json();
          errTxt = j.message || JSON.stringify(j);
        } catch {
          errTxt = await response.text();
        }
        throw new Error(
          errTxt || `Decline failed with status ${response.status}`,
        );
      }

      setMessage("Registration declined successfully!");
      setMessageType("success");
      setShowDeclineModal(false);
      setDeclineReason("");
      setShowDetails(false);
      fetchPendingRegistrations();
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedRecord(null);
  };

  return (
    <div className="user-auth-container">
      <div className="user-auth-header">
        <h1>User Authentication & Access Management</h1>
        <p>Approve or decline pending patient registrations</p>
      </div>
      <div
        className="search-section"
        style={{ marginBottom: "20px", display: "flex", gap: "10px" }}
      >
        <input
          type="text"
          placeholder="Enter Registration Number..."
          value={searchQuery}
          className="search-input"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-search" onClick={handleSearch}>
          Search Request
        </button>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
          <button onClick={() => setMessage("")} className="message-close">
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading pending registrations...</div>
      ) : pendingRegistrations.length === 0 ? (
        <div className="empty-state">
          <p>No pending registrations at this time.</p>
        </div>
      ) : (
        <div className="registrations-table-wrapper">
          <table className="registrations-table">
            <thead>
              <tr>
                <th>Registration #</th>
                <th>Child Name</th>
                <th>Mother Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRegistrations.map((reg) => (
                <tr key={reg.id} className="registration-row">
                  <td>{reg.registration_number}</td>
                  <td>{reg.child_name}</td>
                  <td>{reg.mother_name}</td>
                  <td>{reg.mother_email}</td>
                  <td>{reg.mother_phone}</td>
                  <td>
                    <span
                      className={`status-badge ${reg.status.toLowerCase()}`}
                    >
                      {reg.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-view"
                      onClick={() => handleViewDetails(reg)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseDetails}>
              ×
            </button>

            <h2>Registration Details</h2>

            <div className="details-section">
              <h3>Child Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Registration #:</label>
                  <span>{selectedRecord.registration_number}</span>
                </div>
                <div className="detail-item">
                  <label>Child Name:</label>
                  <span>{selectedRecord.child_name}</span>
                </div>
                <div className="detail-item">
                  <label>Date of Birth:</label>
                  <span>
                    {new Date(selectedRecord.child_dob).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Gender:</label>
                  <span>{selectedRecord.gender || "-"}</span>
                </div>
                <div className="detail-item">
                  <label>Nationality:</label>
                  <span>{selectedRecord.nationality}</span>
                </div>
                <div className="detail-item">
                  <label>Child Number:</label>
                  <span>{selectedRecord.child_number}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Mother Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Mother Name:</label>
                  <span>{selectedRecord.mother_name}</span>
                </div>
                <div className="detail-item">
                  <label>Mother DOB:</label>
                  <span>
                    {new Date(selectedRecord.mother_dob).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedRecord.mother_email}</span>
                </div>
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{selectedRecord.mother_phone}</span>
                </div>
                <div className="detail-item">
                  <label>Living Address:</label>
                  <span>{selectedRecord.living_address}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Birth Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Birth Location:</label>
                  <span>{selectedRecord.birth_location}</span>
                </div>
                <div className="detail-item">
                  <label>Birth Hospital:</label>
                  <span>{selectedRecord.birth_hospital}</span>
                </div>
                <div className="detail-item">
                  <label>Delivery Type:</label>
                  <span>{selectedRecord.delivery_type}</span>
                </div>
                <div className="detail-item">
                  <label>Surgery:</label>
                  <span>{selectedRecord.surgery}</span>
                </div>
                <div className="detail-item">
                  <label>Birth Weight:</label>
                  <span>{selectedRecord.birth_weight} kg</span>
                </div>
                <div className="detail-item">
                  <label>Birth Length:</label>
                  <span>{selectedRecord.birth_length} cm</span>
                </div>
                <div className="detail-item">
                  <label>Head Circumference:</label>
                  <span>{selectedRecord.head_circumference} cm</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Personnel Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Personnel Type:</label>
                  <span>{selectedRecord.personnel_type}</span>
                </div>
                <div className="detail-item">
                  <label>Personnel Name:</label>
                  <span>{selectedRecord.personnel_name}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Additional Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Language:</label>
                  <span>{selectedRecord.language}</span>
                </div>
                <div className="detail-item">
                  <label>Registration Date:</label>
                  <span>
                    {new Date(
                      selectedRecord.registration_date,
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Submitted Date:</label>
                  <span>
                    {new Date(selectedRecord.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="custom-modal-details">
              <h3>Registration Details ({searchResult?.type || "PENDING"})</h3>

              <div className="details-content">
                <p>
                  <strong>Child Name:</strong> {selectedRecord.child_name}
                </p>
                <p>
                  <strong>Reg Number:</strong>{" "}
                  {selectedRecord.registration_number}
                </p>

                {searchResult?.type === "DECLINED" && (
                  <p style={{ color: "red" }}>
                    <strong>Reason for Rejection:</strong>{" "}
                    {selectedRecord.reason}
                  </p>
                )}
              </div>

              <div className="action-buttons">
                {(searchResult?.type === "PENDING" || !searchResult) && (
                  <>
                    <button
                      className="btn btn-approve"
                      onClick={() => handleApprove(selectedRecord.id)}
                    >
                      Approve Registration
                    </button>
                    <button
                      className="btn btn-decline"
                      onClick={() => handleDeclineClick(selectedRecord.id)}
                    >
                      Decline Registration
                    </button>
                  </>
                )}

                <button
                  className="btn btn-cancel"
                  onClick={() => {
                    setShowDetails(false);
                    setSearchResult(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeclineModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h3>Reason for Rejection</h3>
            <textarea
              className="reason-input"
              placeholder="Enter reason here..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn btn-confirm" onClick={confirmDecline}>
                Submit
              </button>
              <button
                className="btn btn-cancel"
                onClick={() => setShowDeclineModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseUserAuthentication;
