import React, { useState, useEffect, useCallback, useRef } from "react";
import "../../../assets/styleSheets/SystemHealth.css";

const REFRESH_INTERVAL = 60_000;

function fmt(val, fallback = "—") {
  return val !== undefined && val !== null ? val : fallback;
}

export default function SystemHealth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(null);
  const retryTimer = useRef(null);

  const fetchHealth = useCallback(
    async (isManual = false) => {
      if (data) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://127.0.0.1:5000/api/admin/system-health",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const json = await res.json();
        if (!res.ok) {
          throw new Error(
            json.error || json.message || `Server error ${res.status}`,
          );
        }
        setData(json);
        setRetryCount(0);
        setLastRefresh(new Date().toLocaleTimeString());
      } catch (e) {
        setError(e.message);
        if (!isManual) {
          const delay = Math.min(10_000 * Math.pow(2, retryCount), 120_000);
          setRetryCount((c) => c + 1);
          retryTimer.current = setTimeout(() => fetchHealth(), delay);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [data, retryCount],
  );

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    const t = setInterval(() => fetchHealth(), REFRESH_INTERVAL);
    return () => {
      clearInterval(t);
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [fetchHealth]);

  const handleManualRefresh = () => fetchHealth(true);

  const dbDot = data?.db_status === "Healthy" ? "sh-dot--green" : "sh-dot--red";
  const dbColor =
    data?.db_status === "Healthy" ? "sh-status--green" : "sh-status--red";
  const mlDot =
    data?.ml_status === "Loaded" ? "sh-dot--green" : "sh-dot--yellow";
  const mlColor =
    data?.ml_status === "Loaded" ? "sh-status--green" : "sh-status--yellow";

  const cpuBar =
    data?.cpu_percent != null ? Math.round(data.cpu_percent) : null;
  const memBar =
    data?.mem_percent != null ? Math.round(data.mem_percent) : null;

  function barColor(pct) {
    if (pct >= 85) return "sh-bar--red";
    if (pct >= 65) return "sh-bar--yellow";
    return "sh-bar--green";
  }

  return (
    <div className="sh-page">
      <div className="sh-header">
        <div>
          <h2 className="sh-title">System Health</h2>
          <p className="sh-subtitle">Live platform diagnostics</p>
        </div>
        <div className="sh-header-right">
          {lastRefresh && (
            <span className="sh-refresh-time">
              {refreshing ? "Refreshing…" : `Updated: ${lastRefresh}`}
            </span>
          )}
          <button
            className="sh-refresh-btn"
            onClick={handleManualRefresh}
            disabled={loading || refreshing}
          >
            {loading || refreshing ? "Loading…" : "↻  Refresh"}
          </button>
        </div>
      </div>

      {loading && !data && (
        <div className="sh-center">
          <div className="sh-spinner" />
          <p>Loading diagnostics…</p>
        </div>
      )}

      {refreshing && data && <div className="sh-refresh-bar" />}

      {error && (
        <div className="sh-error">
          ⚠ {error}
          {retryCount > 0 && (
            <span className="sh-error-retry"> — retrying automatically</span>
          )}
        </div>
      )}

      {data && (
        <>
          <div className="sh-section-label">Services</div>
          <div className="sh-services-row">
            <div className="sh-service-card">
              <div className="sh-service-top">
                <span className="sh-service-name">Database</span>
                <span className={`sh-dot ${dbDot}`} />
              </div>
              <div className={`sh-service-status ${dbColor}`}>
                {fmt(data.db_status)}
              </div>
              <div className="sh-service-detail">
                SQLite · {fmt(data.db_size_kb)} KB
                {data.db_response_ms != null && (
                  <span className="sh-service-ping">
                    {" "}
                    · {data.db_response_ms} ms
                  </span>
                )}
              </div>
            </div>

            <div className="sh-service-card">
              <div className="sh-service-top">
                <span className="sh-service-name">Flask Server</span>
                <span className="sh-dot sh-dot--green" />
              </div>
              <div className="sh-service-status sh-status--green">Running</div>
              <div className="sh-service-detail">
                {fmt(data.platform)} · Python {fmt(data.python)}
                {data.uptime_hours != null && (
                  <span> · up {data.uptime_hours}h</span>
                )}
              </div>
            </div>

            <div className="sh-service-card">
              <div className="sh-service-top">
                <span className="sh-service-name">ML Engine</span>
                <span className={`sh-dot ${mlDot}`} />
              </div>
              <div className={`sh-service-status ${mlColor}`}>
                {fmt(data.ml_status)}
              </div>
              <div className="sh-service-detail">LSTM Growth Predictor</div>
            </div>
          </div>

          {(cpuBar != null || memBar != null) && (
            <>
              <div className="sh-section-label">System Resources</div>
              <div className="sh-resources-row">
                {cpuBar != null && (
                  <div className="sh-resource-card">
                    <div className="sh-resource-header">
                      <span className="sh-resource-name">CPU Usage</span>
                      <span className="sh-resource-value">{cpuBar}%</span>
                    </div>
                    <div className="sh-bar-track">
                      <div
                        className={`sh-bar-fill ${barColor(cpuBar)}`}
                        style={{ width: `${cpuBar}%` }}
                      />
                    </div>
                  </div>
                )}

                {memBar != null && (
                  <div className="sh-resource-card">
                    <div className="sh-resource-header">
                      <span className="sh-resource-name">Memory Usage</span>
                      <span className="sh-resource-value">
                        {memBar}%
                        {data.mem_used_mb != null &&
                          data.mem_total_mb != null && (
                            <span className="sh-resource-sub">
                              {" "}
                              ({data.mem_used_mb} / {data.mem_total_mb} MB)
                            </span>
                          )}
                      </span>
                    </div>
                    <div className="sh-bar-track">
                      <div
                        className={`sh-bar-fill ${barColor(memBar)}`}
                        style={{ width: `${memBar}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="sh-section-label">Database Records</div>
          <div className="sh-counts-grid">
            <div className="sh-count-card">
              <span className="sh-count-value">{fmt(data.total_users)}</span>
              <span className="sh-count-label">Users</span>
            </div>
            <div className="sh-count-card">
              <span className="sh-count-value">{fmt(data.total_children)}</span>
              <span className="sh-count-label">Children</span>
            </div>
            <div className="sh-count-card">
              <span className="sh-count-value">{fmt(data.total_growth)}</span>
              <span className="sh-count-label">Growth Records</span>
            </div>
            <div className="sh-count-card">
              <span className="sh-count-value">{fmt(data.total_vacc)}</span>
              <span className="sh-count-label">Vaccinations</span>
            </div>
            <div className="sh-count-card">
              <span className="sh-count-value">{fmt(data.total_appts)}</span>
              <span className="sh-count-label">Appointments</span>
            </div>
            <div className="sh-count-card">
              <span className="sh-count-value">{fmt(data.total_events)}</span>
              <span className="sh-count-label">Events</span>
            </div>
            <div className="sh-count-card">
              <span className="sh-count-value">{fmt(data.total_messages)}</span>
              <span className="sh-count-label">Messages</span>
            </div>
            <div className="sh-count-card sh-count-card--warn">
              <span className="sh-count-value">{fmt(data.pending_regs)}</span>
              <span className="sh-count-label">Pending Registrations</span>
            </div>
            <div className="sh-count-card sh-count-card--warn">
              <span className="sh-count-value">
                {fmt(data.pending_reports)}
              </span>
              <span className="sh-count-label">Pending Reports</span>
            </div>
            <div className="sh-count-card sh-count-card--warn">
              <span className="sh-count-value">{fmt(data.unread_alerts)}</span>
              <span className="sh-count-label">Unread Health Alerts</span>
            </div>
          </div>

          <div className="sh-footer">Server time: {fmt(data.timestamp)}</div>
        </>
      )}
    </div>
  );
}
