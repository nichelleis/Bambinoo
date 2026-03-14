import React, { useEffect, useState, useCallback } from "react";
import style from "../../assets/styleSheets/ParentDashboard.module.css";

const AVAILABLE_REPORTS = [
  "Growth Report",
  "Vaccination Report",
  "Milestone Report",
  "Health Notes Report",
  "Appointment Report",
  "Analytics Report",
];

function StatusBadge({ status }) {
  const map = {
    Pending: { bg: "#FFF3CD", color: "#856404", icon: "bi-hourglass-split" },
    "In Progress": { bg: "#CCE5FF", color: "#004085", icon: "bi-arrow-repeat" },
    Completed: { bg: "#D4EDDA", color: "#155724", icon: "bi-check-circle-fill" },
    Rejected: { bg: "#F8D7DA", color: "#721C24", icon: "bi-x-circle-fill" },
  };
  const s = map[status] || map["Pending"];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "3px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <i className={`bi ${s.icon}`}></i>
      {status}
    </span>
  );
}

function ReportRequest() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    requested_by: "",
    name: "",
    child_id_number: "",
    phone: "",
    email: "",
  });
  const [selectedReports, setSelectedReports] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState(null); // triggers modal
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setForm(prev => ({
          ...prev,
          name: data?.child?.name || "",
          child_id_number: data?.child?.reg_number || "",
          phone: data?.parent?.phone || "",
          email: data?.parent?.email || "",
        }));
      })
      .catch(console.error);

  }, []);

  const loadRequests = useCallback(() => {
    setLoadingRequests(true);
    fetch("http://localhost:5000/report-requests", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setRequests(Array.isArray(data) ? data : []);
        setLoadingRequests(false);
      })
      .catch(() => setLoadingRequests(false));
  }, [token]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  if (!profile) return <div>Loading Profile...</div>;

  const { child, parent } = profile;

  const toggleReport = (report) => {
    setSelectedReports((prev) =>
      prev.includes(report) ? prev.filter((r) => r !== report) : [...prev, report]
    );
  };

  const handleInput = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!selectedReports.length) {
      setError("Please select at least one report type.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        requested_by: form.requested_by,
        name: form.name,
        child_id_number: form.child_id_number,
        phone: form.phone,
        email: form.email,
        reports_requested: selectedReports,
      };

      const res = await fetch("http://localhost:5000/report-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSuccessId(data.report_request_id);
      setSelectedReports([]);
      setForm({ requested_by: "" });
      loadRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="container-fluid">
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(37,165,185,0.15) 0%, rgba(252,99,255,0.06) 100%)",
          border: "1px solid rgba(22,163,110,0.2)",
          borderRadius: 20,
          padding: "22px 28px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 4px 24px rgba(22,163,110,0.07)",
        }}
      >
        <span
          style={{
            background: "linear-gradient(135deg,#25a5b9,#6c63ff)",
            borderRadius: 14,
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <i className="bi bi-file-earmark-text-fill" style={{ color: "#fff", fontSize: 22 }}></i>
        </span>
        <div>
          <h4 className="mb-0" style={{ fontWeight: 700 }}>
            Report Request
          </h4>
          <p className="mb-0" style={{ color: "#6c757d", fontSize: 14 }}>
            Submit a request for specific health reports and track your previous requests.
          </p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className={style.dashboardCard} style={{ borderRadius: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
              <i
                className="bi bi-plus-circle-fill me-2"
                style={{ color: "#25a5b9" }}
              ></i>
              New Report Request
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                  Who request
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="requested_by"
                  value={form.requested_by}
                  onChange={handleInput}
                  required
                  placeholder="Enter your name"
                  style={{ borderRadius: 10 }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                  Child Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleInput}
                  required
                  style={{ borderRadius: 10, backgroundColor: "#f8f9fa" }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                  Child Registration / ID
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="child_id_number"
                  value={form.child_id_number}
                  onChange={handleInput}
                  required
                  style={{ borderRadius: 10, backgroundColor: "#f8f9fa" }}
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={form.phone}
                    onChange={handleInput}
                    required
                    style={{ borderRadius: 10, backgroundColor: "#f8f9fa" }}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={form.email}
                    onChange={handleInput}
                    required
                    style={{ borderRadius: 10, backgroundColor: "#f8f9fa" }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                  Select Reports Needed
                </label>
                <div
                  style={{
                    background: "#f8f9fa",
                    borderRadius: 12,
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {AVAILABLE_REPORTS.map((report) => (
                    <label
                      key={report}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                        fontSize: 14,
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: selectedReports.includes(report)
                          ? "rgba(37,165,185,0.12)"
                          : "transparent",
                        border: selectedReports.includes(report)
                          ? "1.5px solid rgba(37,165,185,0.5)"
                          : "1.5px solid transparent",
                        transition: "all 0.18s",
                        userSelect: "none",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report)}
                        onChange={() => toggleReport(report)}
                        style={{ accentColor: "#25a5b9", width: 16, height: 16 }}
                      />
                      <i
                        className="bi bi-file-earmark-bar-graph"
                        style={{ color: "#25a5b9" }}
                      ></i>
                      {report}
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div
                  className="alert alert-danger py-2 mb-3"
                  style={{ borderRadius: 10, fontSize: 13 }}
                >
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "linear-gradient(135deg,#25a5b9,#6c63ff)",
                  border: "none",
                  color: "#fff",
                  padding: "11px 28px",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 15,
                  width: "100%",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {submitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Sending…
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill me-2"></i>Send Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-6">
          <div className={style.dashboardCard} style={{ borderRadius: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
              <i
                className="bi bi-clock-history me-2"
                style={{ color: "#6c63ff" }}
              ></i>
              My Requests
            </div>

            {loadingRequests ? (
              <div className="text-center py-4" style={{ color: "#aaa" }}>
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                Loading…
              </div>
            ) : requests.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#aaa",
                }}
              >
                <i
                  className="bi bi-inbox"
                  style={{ fontSize: 40, display: "block", marginBottom: 10 }}
                ></i>
                <p style={{ fontSize: 14 }}>No requests have been submitted yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {requests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      background: "#f8f9fa",
                      borderRadius: 12,
                      padding: "14px 16px",
                      border: "1px solid #e9ecef",
                      transition: "box-shadow 0.18s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,165,185,0.12)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.boxShadow = "none")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                        flexWrap: "wrap",
                        gap: 6,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: "#25a5b9",
                            fontFamily: "monospace",
                            letterSpacing: 0.5,
                          }}
                        >
                          {req.report_request_id}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#aaa",
                            display: "block",
                            marginTop: 2,
                          }}
                        >
                          {new Date(req.created_at).toLocaleString()}
                        </span>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {req.reports_requested.map((r) => (
                        <span
                          key={r}
                          style={{
                            background: "rgba(108,99,255,0.1)",
                            color: "#6c63ff",
                            borderRadius: 20,
                            padding: "2px 10px",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {successId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "36px 40px",
              maxWidth: 420,
              width: "90%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              animation: "fadeInScale 0.25s ease",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                background: "linear-gradient(135deg,#25a5b9,#6c63ff)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <i className="bi bi-check-lg" style={{ color: "#fff", fontSize: 30 }}></i>
            </div>

            <h5 style={{ fontWeight: 700, marginBottom: 8 }}>Request Submitted!</h5>
            <p style={{ color: "#6c757d", fontSize: 14, marginBottom: 20 }}>
              Your report request has been received and is currently being processed.
            </p>

            <div
              style={{
                background: "#f0fdf4",
                border: "1.5px dashed #25a5b9",
                borderRadius: 12,
                padding: "12px 20px",
                marginBottom: 24,
              }}
            >
              <p style={{ fontSize: 12, color: "#6c757d", margin: 0 }}>
                Your Request ID
              </p>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#25a5b9",
                  letterSpacing: 1.5,
                  margin: "4px 0 0",
                }}
              >
                {successId}
              </p>
              <p style={{ fontSize: 11, color: "#aaa", margin: "4px 0 0" }}>
                Save this ID to track your request
              </p>
            </div>

            <button
              onClick={() => setSuccessId(null)}
              style={{
                background: "linear-gradient(135deg,#25a5b9,#6c63ff)",
                border: "none",
                color: "#fff",
                padding: "10px 32px",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default ReportRequest;
