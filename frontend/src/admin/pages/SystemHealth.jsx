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
}