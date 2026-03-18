import React, { useState, useEffect, useCallback, useRef } from "react";
import "./SystemHealth.css";

const REFRESH_INTERVAL = 60_000;

function fmt(val, fallback = "—") {
  return val !== undefined && val !== null ? val : fallback;
}