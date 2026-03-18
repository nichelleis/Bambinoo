import React, { useState, useEffect, useCallback, useRef } from "react";
import "./SystemHealth.css";

const REFRESH_INTERVAL = 60_000;

function fmt(val, fallback = "—") {
  return val !== undefined && val !== null ? val : fallback;
}

export default function SystemHealth() {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState(null);
  const [retryCount, setRetryCount]   = useState(0);
  const [lastRefresh, setLastRefresh] = useState(null);
  const retryTimer = useRef(null);

  const fetchHealth = useCallback(async (isManual = false) => {
    if (data) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/api/admin/system-health", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.message || `Server error ${res.status}`);
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

  }, [data, retryCount]);


  useEffect(() => { fetchHealth(); }, []);


  useEffect(() => {
    const t = setInterval(() => fetchHealth(), REFRESH_INTERVAL);
    return () => {
      clearInterval(t);
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [fetchHealth]);

  const handleManualRefresh = () => fetchHealth(true);


  const dbDot   = data?.db_status === "Healthy" ? "sh-dot--green" : "sh-dot--red";
  const dbColor = data?.db_status === "Healthy" ? "sh-status--green" : "sh-status--red";
  const mlDot   = data?.ml_status === "Loaded"  ? "sh-dot--green" : "sh-dot--yellow";
  const mlColor = data?.ml_status === "Loaded"  ? "sh-status--green" : "sh-status--yellow";

  const cpuBar = data?.cpu_percent != null ? Math.round(data.cpu_percent) : null;
  const memBar = data?.mem_percent != null ? Math.round(data.mem_percent) : null;

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
    </div>
  )
}