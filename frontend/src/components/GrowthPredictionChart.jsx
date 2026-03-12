import React, { useEffect, useRef, useState } from "react";
import Plotly from "plotly.js-dist";
import "./GrowthPredictionChart.css";

const WHO_W = {
  boy: {
    months: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
    sd3neg:[2.1,2.9,3.8,4.4,4.9,5.3,5.7,5.9,6.2,6.4,6.6,6.8,6.9,7.1,7.2,7.4,7.5,7.7,7.8,8.0,8.1,8.2,8.4,8.5,8.6],
    sd2neg:[2.5,3.4,4.3,5.0,5.6,6.0,6.4,6.7,7.0,7.2,7.5,7.7,7.8,8.0,8.2,8.4,8.6,8.7,8.9,9.1,9.2,9.4,9.5,9.7,9.8],
    sd1neg:[2.9,3.9,4.9,5.7,6.2,6.7,7.1,7.5,7.8,8.1,8.4,8.6,8.8,9.0,9.2,9.4,9.6,9.8,10.0,10.2,10.4,10.5,10.7,10.9,11.0],
    median:[3.3,4.5,5.6,6.4,7.0,7.5,7.9,8.3,8.6,8.9,9.2,9.4,9.6,9.9,10.1,10.3,10.5,10.7,10.9,11.1,11.3,11.5,11.8,12.0,12.2],
    sd1pos:[3.9,5.1,6.3,7.2,7.8,8.4,8.8,9.2,9.6,9.9,10.2,10.5,10.8,11.0,11.3,11.5,11.7,12.0,12.2,12.4,12.6,12.9,13.1,13.3,13.5],
    sd2pos:[4.4,5.8,7.1,8.0,8.7,9.3,9.8,10.3,10.7,11.0,11.4,11.7,12.0,12.3,12.6,12.8,13.1,13.4,13.7,13.9,14.2,14.5,14.7,15.0,15.3],
  },
  girl: {
    months: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
    sd3neg:[2.0,2.7,3.4,3.9,4.3,4.7,5.0,5.3,5.5,5.7,5.9,6.0,6.2,6.4,6.5,6.7,6.9,7.0,7.2,7.4,7.5,7.7,7.9,8.0,8.2],
    sd2neg:[2.4,3.2,4.0,4.5,5.0,5.4,5.7,6.0,6.3,6.5,6.7,6.9,7.1,7.2,7.4,7.6,7.8,8.0,8.2,8.4,8.6,8.8,9.0,9.2,9.4],
    sd1neg:[2.8,3.6,4.5,5.2,5.7,6.1,6.5,6.8,7.1,7.3,7.6,7.8,8.0,8.2,8.4,8.6,8.8,9.0,9.2,9.4,9.6,9.8,10.0,10.2,10.5],
    median:[3.2,4.2,5.1,5.8,6.4,6.9,7.3,7.6,7.9,8.2,8.5,8.7,8.9,9.2,9.4,9.6,9.8,10.0,10.2,10.4,10.6,10.9,11.1,11.4,11.5],
    sd1pos:[3.7,4.8,5.8,6.6,7.3,7.8,8.2,8.6,9.0,9.3,9.6,9.9,10.1,10.4,10.6,10.9,11.1,11.4,11.6,11.9,12.1,12.4,12.6,12.9,13.2],
    sd2pos:[4.2,5.5,6.6,7.5,8.2,8.8,9.3,9.8,10.2,10.5,10.9,11.2,11.5,11.8,12.1,12.4,12.6,12.9,13.2,13.5,13.8,14.1,14.4,14.7,15.0],
  },
};

const WHO_H = {
  boy: {
    months: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
    sd3neg:[44.2,48.9,52.4,55.3,57.6,59.6,61.2,62.7,64.0,65.2,66.4,67.6,68.6,69.6,70.6,71.6,72.5,73.3,74.2,75.0,75.8,76.5,77.2,77.9,78.7],
    sd2neg:[46.1,50.8,54.4,57.3,59.7,61.7,63.3,64.8,66.2,67.5,68.7,69.9,71.0,72.1,73.1,74.1,75.0,75.9,76.9,77.7,78.6,79.4,80.2,81.0,81.7],
    sd1neg:[48.0,52.8,56.4,59.4,61.8,63.8,65.5,67.0,68.4,69.7,71.0,72.2,73.4,74.5,75.6,76.6,77.6,78.6,79.6,80.5,81.4,82.3,83.1,84.0,84.8],
    median:[49.9,54.7,58.4,61.4,63.9,65.9,67.6,69.2,70.6,72.0,73.3,74.5,75.7,76.9,78.0,79.1,80.2,81.2,82.3,83.2,84.2,85.1,86.0,86.9,87.8],
    sd1pos:[51.8,56.7,60.5,63.5,65.9,68.0,69.8,71.3,72.8,74.2,75.5,76.8,78.0,79.2,80.4,81.5,82.6,83.7,84.8,85.8,86.8,87.8,88.7,89.7,90.7],
    sd2pos:[53.7,58.6,62.5,65.5,68.0,70.1,71.9,73.5,75.0,76.5,77.8,79.1,80.3,81.6,82.8,84.0,85.1,86.2,87.4,88.4,89.5,90.5,91.5,92.5,93.6],
  },
  girl: {
    months: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
    sd3neg:[43.6,47.8,51.0,53.5,55.6,57.4,58.9,60.3,61.5,62.7,63.8,64.9,65.8,66.8,67.7,68.6,69.4,70.2,71.0,71.8,72.6,73.3,74.0,74.8,75.4],
    sd2neg:[45.4,49.8,53.0,55.6,57.8,59.6,61.2,62.7,64.0,65.2,66.4,67.5,68.6,69.6,70.6,71.5,72.4,73.3,74.2,75.0,75.9,76.7,77.5,78.3,79.1],
    sd1neg:[47.3,51.7,55.0,57.7,60.0,61.8,63.5,65.0,66.4,67.7,68.9,70.1,71.2,72.3,73.3,74.3,75.3,76.2,77.2,78.1,79.0,79.9,80.7,81.6,82.4],
    median:[49.1,53.7,57.1,59.8,62.1,64.0,65.7,67.3,68.7,70.1,71.5,72.8,74.0,75.2,76.4,77.5,78.6,79.7,80.7,81.7,82.7,83.7,84.6,85.5,86.4],
    sd1pos:[51.0,55.6,59.1,62.0,64.3,66.2,68.0,69.6,71.1,72.6,73.9,75.3,76.6,77.9,79.1,80.3,81.4,82.5,83.6,84.7,85.7,86.8,87.7,88.7,89.7],
    sd2pos:[52.9,57.5,61.1,64.1,66.5,68.5,70.3,71.9,73.5,75.0,76.4,77.8,79.2,80.5,81.8,83.0,84.2,85.4,86.6,87.7,88.8,89.9,91.0,92.0,93.0],
  },
};

const interp = (x, xs, ys) => {
  if (x <= xs[0]) return ys[0];
  if (x >= xs[xs.length - 1]) return ys[xs.length - 1];
  const i = xs.findIndex(v => v > x) - 1;
  return ys[i] + ((x - xs[i]) / (xs[i + 1] - xs[i])) * (ys[i + 1] - ys[i]);
};

const drawChart = (divRef, genderStr, visits, predictions, field, sdData, yLabel, yRange) => {
  if (!divRef.current) return;
  const M        = sdData.months;
  const top      = M.map(() => yRange[1] + 2);
  const dotColor = genderStr === "boy" ? "#2d6be4" : "#e84d8a";

  const bridge = predictions.length ? {
    x: [visits[visits.length - 1].age_months, ...predictions.map(p => p.age_months)],
    y: [visits[visits.length - 1][field],      ...predictions.map(p => p[field])],
  } : null;

  const traces = [
    { x:M, y:sdData.sd3neg, fill:"tozeroy", fillcolor:"rgba(220,50,50,0.80)",   line:{color:"transparent",width:0}, name:"<-3SD Severely Underweight",   showlegend:true,  type:"scatter", mode:"lines", hoverinfo:"skip" },
    { x:M, y:sdData.sd2neg, fill:"tonexty", fillcolor:"rgba(235,140,30,0.75)",  line:{color:"transparent",width:0}, name:"-3SD to -2SD Mod. Underweight", showlegend:true,  type:"scatter", mode:"lines", hoverinfo:"skip" },
    { x:M, y:sdData.sd1neg, fill:"tonexty", fillcolor:"rgba(245,245,210,0.90)", line:{color:"transparent",width:0}, name:"-2SD to -1SD Underweight Alert", showlegend:true,  type:"scatter", mode:"lines", hoverinfo:"skip" },
    { x:M, y:sdData.sd2pos, fill:"tonexty", fillcolor:"rgba(170,220,150,0.60)", line:{color:"transparent",width:0}, name:"-1SD to +2SD Normal",            showlegend:true,  type:"scatter", mode:"lines", hoverinfo:"skip" },
    { x:M, y:top,           fill:"tonexty", fillcolor:"rgba(232,77,138,0.15)",  line:{color:"transparent",width:0}, name:">+2SD Overweight",               showlegend:true,  type:"scatter", mode:"lines", hoverinfo:"skip" },
    { x:M, y:sdData.sd3neg, line:{color:"#b22222",width:1},            type:"scatter", mode:"lines", showlegend:false, hoverinfo:"skip" },
    { x:M, y:sdData.sd2neg, line:{color:"#cc6600",width:1},            type:"scatter", mode:"lines", showlegend:false, hoverinfo:"skip" },
    { x:M, y:sdData.sd1neg, line:{color:"#999900",width:1,dash:"dot"}, type:"scatter", mode:"lines", showlegend:false, hoverinfo:"skip" },
    { x:M, y:sdData.sd1pos, line:{color:"#999900",width:1,dash:"dot"}, type:"scatter", mode:"lines", showlegend:false, hoverinfo:"skip" },
    { x:M, y:sdData.sd2pos, line:{color:"#336633",width:1},            type:"scatter", mode:"lines", showlegend:false, hoverinfo:"skip" },
    { x:M, y:sdData.median, line:{color:"#10b981",width:2.5}, name:"WHO Median (50th %ile)", type:"scatter", mode:"lines", showlegend:true, hoverinfo:"skip" },
    {
      x: visits.map(v => v.age_months), y: visits.map(v => v[field]),
      type:"scatter", mode:"lines+markers", name:"Child's measurements",
      line:{color:dotColor, width:2, dash:"dot"},
      marker:{size:7, color:dotColor, symbol:"circle"},
      hovertemplate:`Age: %{x} mo<br>${yLabel}: %{y}<extra></extra>`,
    },
    ...(bridge ? [{
      x: bridge.x, y: bridge.y,
      type:"scatter", mode:"lines+markers", name:"LSTM Predicted trajectory",
      line:{color:"#7c3aed", width:2.5, dash:"dash"},
      marker:{size:8, color:"#7c3aed", symbol:"diamond"},
      hovertemplate:`Age: %{x} mo<br>Predicted ${yLabel}: %{y}<extra></extra>`,
    }] : []),
  ];

  const layout = {
    xaxis:{
      title:{ text:"Age (months)", font:{size:11, color:"#8a82a8"}, standoff:8 },
      tickvals:[0,2,4,6,8,10,12,14,16,18,20,22,24],
      ticktext:["0","2","4","6","8","10","12","14","16","18","20","22","24"],
      range:[-0.5, 24.5], showgrid:true, gridcolor:"rgba(221,226,240,0.6)",
      zeroline:false, linecolor:"#dde2f0", mirror:true, tickfont:{size:10, color:"#8a82a8"},
    },
    yaxis:{
      title:{ text:yLabel, font:{size:11, color:"#8a82a8"}, standoff:6 },
      range:yRange, showgrid:true, gridcolor:"rgba(221,226,240,0.6)",
      zeroline:false, linecolor:"#dde2f0", mirror:true, tickfont:{size:10, color:"#8a82a8"},
      dtick: field === "weight" ? 1 : 5,
    },
    legend:{
      orientation:"h", x:0, y:-0.24, xanchor:"left", yanchor:"top",
      bgcolor:"transparent", borderwidth:0,
      font:{size:10, color:"#555", family:"DM Sans, sans-serif"}, itemwidth:30,
    },
    plot_bgcolor:"#fafbff", paper_bgcolor:"#ffffff",
    margin:{ t:12, b:140, l:60, r:20 },
    hovermode:"closest",
  };

  Plotly.react(divRef.current, traces, layout, { responsive:true, displayModeBar:false });
};


export default function GrowthPredictionChart({ selectedChild }) {
  const weightRef = useRef(null);
  const heightRef = useRef(null);

  const [predData, setPredData] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const isParentMode = !selectedChild;

  useEffect(() => {
    setPredData(null);
    setError(null);

    if (!isParentMode && !selectedChild) return;

    const fetchPredictions = async () => {
      setLoading(true);
      try {
        const token   = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        let res;

        if (isParentMode) {
          res = await fetch("http://127.0.0.1:5000/predict-growth", {
            method: "POST",
            headers,
          });
        } else {
          const numericId = parseInt(String(selectedChild.id).replace("CH", ""), 10);
          res = await fetch(`http://127.0.0.1:5000/predict-growth/${numericId}`, { headers });
        }

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Prediction failed.");
          return;
        }
        setPredData(data);
      } catch {
        setError("Cannot reach the server. Make sure Flask is running on port 5000.");
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [isParentMode, selectedChild?.id]);

  useEffect(() => {
    if (!predData?.actuals?.length) return;
    const g    = predData.gender || "boy";
    const v    = predData.actuals;
    const p    = predData.predictions || [];
    drawChart(weightRef, g, v, p, "weight", WHO_W[g], "Weight (kg)", [0, 16]);
    drawChart(heightRef, g, v, p, "height", WHO_H[g], "Height (cm)", [40, 100]);
  }, [predData]);

  if (!isParentMode && !selectedChild) return (
    <div className="gp-state-center">
      <i className="ri-user-search-line gp-state-icon" />
      <p className="gp-state-text">Select a child to view the growth chart.</p>
    </div>
  );

  if (loading) return (
    <div className="gp-state-center">
      <div className="gp-spinner" />
      <p className="gp-state-text">Running LSTM growth prediction…</p>
      <p className="gp-state-text" style={{ fontSize:"0.8rem", color:"#94a3b8", marginTop:"4px" }}>
        Loading model from server
      </p>
    </div>
  );

  if (error) return (
    <div className="gp-state-center">
      <i className="ri-error-warning-line gp-state-icon gp-state-icon--error" />
      <p className="gp-state-text gp-state-text--error">{error}</p>
    </div>
  );

  if (!predData) return null;

  const genderStr   = predData.gender || "boy";
  const isBoy       = genderStr === "boy";
  const visits      = predData.actuals     || [];
  const predictions = predData.predictions || [];
  const isMLModel   = predData.model_used !== "who_fallback";
  const blendInfo   = predData.blend_info  || null;
  const lstmPct     = blendInfo ? Math.round(blendInfo.lstm_weight * 100) : 5;
  const whoPct      = blendInfo ? Math.round(blendInfo.who_weight  * 100) : 95;

  if (!visits.length) return (
    <div className="gp-state-center">
      <i className="ri-bar-chart-grouped-line gp-state-icon" />
      <h3 className="gp-state-heading">No Growth Data Available</h3>
      <p className="gp-state-text">Growth records need to be entered before predictions can be generated.</p>
    </div>
  );

  const lastVisit = visits[visits.length - 1];
  const nextPred  = predictions[0];

  return (
    <div className="gp-wrapper">

      <div className={`gp-banner ${isBoy ? "gp-banner--boy" : "gp-banner--girl"}`}>
        <div className="gp-banner-icon"><i className="ri-heart-pulse-line" /></div>
        <div className="gp-banner-body">
          <div className="gp-banner-top">
            <span className="gp-banner-title">
              {isParentMode ? "Your Child" : selectedChild?.name}
              <span className="gp-banner-subtitle">WHO Growth Chart — Sri Lankan Health Card Standard</span>
            </span>

            {isMLModel ? (
              <span className="gp-model-badge" style={{ background:"#ede9fe", color:"#7c3aed" }}>
                <i className="ri-cpu-line" /> LSTM {lstmPct}% · WHO {whoPct}%
              </span>
            ) : (
              <span className="gp-model-badge" style={{ background:"#fef3c7", color:"#b45309", fontSize:"0.7rem" }}>
                <i className="ri-alert-line" /> WHO Fallback — run generate_model_files.py
              </span>
            )}
          </div>

          <div className="gp-legend-grid">
            <div className="gp-legend-item"><span className="gp-swatch gp-swatch--red" />    &lt;-3SD<span className="gp-legend-desc">Severely Underweight</span></div>
            <div className="gp-legend-item"><span className="gp-swatch gp-swatch--amber" />  -3SD to -2SD<span className="gp-legend-desc">Mod. Underweight</span></div>
            <div className="gp-legend-item"><span className="gp-swatch gp-swatch--yellow" /> -2SD to -1SD<span className="gp-legend-desc">Underweight Alert</span></div>
            <div className="gp-legend-item"><span className="gp-swatch gp-swatch--green" />  -1SD to +2SD<span className="gp-legend-desc">Normal Range</span></div>
            <div className="gp-legend-item"><span className="gp-swatch gp-swatch--pink" />   &gt;+2SD<span className="gp-legend-desc">Overweight</span></div>
            <div className="gp-legend-item"><span className="gp-swatch gp-swatch--teal" />   — Median<span className="gp-legend-desc">WHO 50th %ile</span></div>
            <div className="gp-legend-item"><span className={`gp-swatch ${isBoy ? "gp-swatch--blue" : "gp-swatch--pink2"}`} /> ● Actual<span className="gp-legend-desc">Measurements</span></div>
            <div className="gp-legend-item"><span className="gp-swatch gp-swatch--purple" /> ◆ Predicted<span className="gp-legend-desc">LSTM Trajectory</span></div>
          </div>
        </div>
      </div>

      <div className="gp-stats-row">
        <div className="gp-stat-card">
          <span className="gp-stat-label">Current Age</span>
          <span className={`gp-stat-value ${isBoy ? "gp-stat-value--boy" : "gp-stat-value--girl"}`}>{lastVisit.age_months}<small> mo</small></span>
        </div>
        <div className="gp-stat-card">
          <span className="gp-stat-label">Current Height</span>
          <span className={`gp-stat-value ${isBoy ? "gp-stat-value--boy" : "gp-stat-value--girl"}`}>{lastVisit.height}<small> cm</small></span>
        </div>
        <div className="gp-stat-card">
          <span className="gp-stat-label">Current Weight</span>
          <span className={`gp-stat-value ${isBoy ? "gp-stat-value--boy" : "gp-stat-value--girl"}`}>{lastVisit.weight}<small> kg</small></span>
        </div>
        {nextPred && <>
          <div className="gp-stat-card gp-stat-card--predicted">
            <span className="gp-stat-label"><i className="ri-cpu-line" /> Next Pred. Height</span>
            <span className="gp-stat-value gp-stat-value--purple">{nextPred.height}<small> cm @ {nextPred.age_months}mo</small></span>
          </div>
          <div className="gp-stat-card gp-stat-card--predicted">
            <span className="gp-stat-label"><i className="ri-cpu-line" /> Next Pred. Weight</span>
            <span className="gp-stat-value gp-stat-value--purple">{nextPred.weight}<small> kg @ {nextPred.age_months}mo</small></span>
          </div>
        </>}
        <div className="gp-stat-card gp-stat-card--visits">
          <span className="gp-stat-label">Total Visits</span>
          <span className="gp-stat-value gp-stat-value--green">{visits.length}<small> recorded</small></span>
        </div>
        <div className="gp-stat-card gp-stat-card--visits">
          <span className="gp-stat-label">Checkpoints Left</span>
          <span className="gp-stat-value gp-stat-value--green">{predictions.length}<small> ahead</small></span>
        </div>
      </div>

      <div className="gp-chart-card">
        <h4 className="gp-chart-title">
          <i className="ri-scales-3-line" /> Weight for Age
          <span className="gp-chart-subtitle">Sri Lankan Health Card Standard</span>
        </h4>
        <div ref={weightRef} className="gp-plotly-container" />
      </div>

      <div className="gp-chart-card">
        <h4 className="gp-chart-title">
          <i className="ri-arrow-up-circle-line" /> Height for Age
          <span className="gp-chart-subtitle">Sri Lankan Health Card Standard</span>
        </h4>
        <div ref={heightRef} className="gp-plotly-container" />
      </div>

      {predictions.length > 0 && (
        <div className="gp-table-card">
          <h4 className="gp-chart-title">
            <i className="ri-table-line" /> Predicted Checkpoint Values
            <span className="gp-ai-badge">
              <i className="ri-sparkling-line" /> {isMLModel ? "LSTM Neural Network" : "WHO Ratio Projection"}
            </span>
          </h4>
          <div className="gp-table-scroll">
            <table className="gp-table">
              <thead>
                <tr><th>Age</th><th>Pred. Height</th><th>Pred. Weight</th><th>WHO Median Ht</th><th>WHO Median Wt</th></tr>
              </thead>
              <tbody>
                {predictions.map((p, i) => (
                  <tr key={i}>
                    <td>{p.age_months} mo</td>
                    <td className="gp-td-predicted">{p.height} cm</td>
                    <td className="gp-td-predicted">{p.weight} kg</td>
                    <td className="gp-td-who">{interp(p.age_months, WHO_H[genderStr].months, WHO_H[genderStr].median).toFixed(1)} cm</td>
                    <td className="gp-td-who">{interp(p.age_months, WHO_W[genderStr].months, WHO_W[genderStr].median).toFixed(2)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="gp-disclaimer">
            <i className="ri-information-line" />
            {isMLModel
              ? `Predictions blend ${lstmPct}% LSTM neural network + ${whoPct}% WHO biological anchor, with bias correction applied. For clinical decisions always consult a healthcare professional.`
              : "ML model files not found — using WHO fallback. Run generate_model_files.py inside the ml/ folder to enable LSTM predictions."}
          </p>
        </div>
      )}
    </div>
  );
}