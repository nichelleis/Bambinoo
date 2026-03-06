import "./DoctorAi.css";
import React, { useState, useEffect, useRef } from "react";
import Plotly from "plotly.js-dist";
import GrowthPredictionChart from "../../../components/GrowthPredictionChart";


export default function AIAnalytics({ selectedChild }) {
  const [activeTab, setActiveTab] = useState("insights");


  const [clinicalData, setClinicalData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    if (!selectedChild) return;
    const aiTabs = ["insights", "diagnostics", "patterns", "compliance"];
    if (!aiTabs.includes(activeTab)) return;
    if (clinicalData && clinicalData._childId === selectedChild.id) return;

    const fetchInsights = async () => {
      setAiLoading(true);
      setAiError(null);
      try {
        const numericId = parseInt(String(selectedChild.id).replace("CH", ""));
        const token = localStorage.getItem("token");
        const res = await fetch(`http://127.0.0.1:5000/doctor/ai-insights/${numericId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          setAiError({
            type:   data.error_type  || "unknown",
            title:  data.error_title || "AI Analysis Failed",
            detail: data.error_detail || data.error || "An unexpected error occurred.",
            fix:    data.error_fix   || "Check the backend console for more details.",
          });
          return;
        }
        setClinicalData({
          _childId: selectedChild.id,
          aiConfidence: data.aiConfidence,
          lastAnalyzed: data.lastAnalyzed,
          dataPoints: data.dataPoints,
          criticalAlerts:    data.insights?.criticalAlerts    ?? [],
          redFlags:          data.insights?.redFlags          ?? [],
          aiRecommendations: data.insights?.aiRecommendations ?? [],
          diagnosticSupport: data.diagnostics?.diagnosticSupport ?? [],
          medicationAnalysis: data.diagnostics?.medicationAnalysis ?? { currentMedications: [], interactions: [], alternatives: [] },
          patternRecognition: data.patterns?.patternRecognition ?? [],
          populationComparison: data.patterns?.populationComparison ?? { similarCases: 0, outcomeData: [], successfulProtocols: [] },
          complianceInsights: {
            overallAdherence: data.compliance?.overallAdherence ?? 0,
            missedDoses:      data.compliance?.missedDoses ?? 0,
            patterns:         data.compliance?.patterns ?? [],
            parentEngagement: data.compliance?.parentEngagement ?? {}
          },
          literatureInsights: data.literatureInsights ?? [],
        });
      } catch (err) {
        setAiError({
          type:   "network_error",
          title:  "Cannot Reach Backend",
          detail: "The request to the backend server failed. The server may be offline.",
          fix:    "Make sure the Flask backend is running on port 5000 and try again.",
        });
      } finally {
        setAiLoading(false);
      }
    };

    fetchInsights();
  }, [selectedChild, activeTab]);

  useEffect(() => {
    setClinicalData(null);
    setAiError(null);
  }, [selectedChild?.id]);

  const ERROR_META = {
    invalid_api_key:  { icon: "ri-key-2-line",        color: "#E55B4D", bg: "#FFF0EF" },
    quota_exceeded:   { icon: "ri-time-line",          color: "#E07B00", bg: "#FFF8EC" },
    permission_denied:{ icon: "ri-shield-cross-line",  color: "#7C3AED", bg: "#F5F0FF" },
    network_error:    { icon: "ri-wifi-off-line",      color: "#2563EB", bg: "#EFF6FF" },
    unknown:          { icon: "ri-error-warning-line", color: "#6B7280", bg: "#F9FAFB" },
  };

  const AI_TABS = ["insights", "diagnostics", "patterns", "compliance"];

  const _cd = clinicalData;

  if (!selectedChild) {
    return (
      <div className="ai-empty">
        <div className="empty-card">
          <i className="ri-robot-2-line"></i>
          <h2>No Patient Selected</h2>
          <p>
            Please search and select a patient to view
            <br />
            AI-powered clinical decision support and analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-analytics-page">

      <div className="ai-header">
        <div className="header-left">
          
          <div>
            <h2>AI Clinical Decision Support</h2>
            <p>Intelligent analytics for: {selectedChild.name}</p>
          </div>
        </div>
        <div className="ai-meta">
          <div className="meta-badge">
            <i className="ri-database-2-line"></i>
            <span>{_cd ? _cd.dataPoints : "—"} data points analyzed</span>
          </div>
          <div className="meta-badge">
            <i className="ri-refresh-line"></i>
            <span>{_cd ? _cd.lastAnalyzed : "—"}</span>
          </div>
          <div className="confidence-badge">
            AI Confidence: {_cd ? `${_cd.aiConfidence}%` : "—"}
          </div>
        </div>
      </div>


      <div className="ai-tabs">
        <button 
          className={activeTab === "insights" ? "tab active" : "tab"}
          onClick={() => setActiveTab("insights")}
        >
          <i className="ri-lightbulb-line"></i>
          Clinical Insights
        </button>
        <button 
          className={activeTab === "diagnostics" ? "tab active" : "tab"}
          onClick={() => setActiveTab("diagnostics")}
        >
          <i className="ri-stethoscope-line"></i>
          Diagnostic Support
        </button>
        <button 
          className={activeTab === "patterns" ? "tab active" : "tab"}
          onClick={() => setActiveTab("patterns")}
        >
          <i className="ri-line-chart-line"></i>
          Pattern Analysis
        </button>
        <button 
          className={activeTab === "compliance" ? "tab active" : "tab"}
          onClick={() => setActiveTab("compliance")}
        >
          <i className="ri-checkbox-circle-line"></i>
          Compliance Tracking
        </button>
        <button 
          className={activeTab === "growth-prediction" ? "tab active" : "tab"}
          onClick={() => setActiveTab("growth-prediction")}
        >
          <i className="ri-line-chart-fill"></i>
          Growth Prediction
        </button>
      </div>

      {AI_TABS.includes(activeTab) && aiLoading && (
        <div className="ai-loading-state">
          <div className="ai-spinner" />
          <h3>Analysing patient data with AI…</h3>
          <p>Gemini is reviewing <strong>{selectedChild.name}</strong>'s complete health records.</p>
          <p className="ai-loading-sub">This may take 10–20 seconds on first load.</p>
        </div>
      )}

      {AI_TABS.includes(activeTab) && !aiLoading && aiError && (() => {
        const meta = ERROR_META[aiError.type] || ERROR_META.unknown;
        return (
          <div className="ai-error-state">
            <div className="ai-error-card" style={{ borderTop: `4px solid ${meta.color}` }}>
              <div className="ai-error-icon-wrap" style={{ background: meta.bg }}>
                <i className={meta.icon} style={{ color: meta.color }} />
              </div>
              <h3 className="ai-error-title">{aiError.title}</h3>
              <p className="ai-error-detail">{aiError.detail}</p>
              <div className="ai-error-fix">
                <i className="ri-tools-line" />
                <span><strong>How to fix:</strong> {aiError.fix}</span>
              </div>
              {aiError.type === "invalid_api_key" && (
                <div className="ai-error-steps">
                  <p className="ai-error-steps-title">Quick steps:</p>
                  <ol>
                    <li>Go to <strong>aistudio.google.com</strong> → Get API Key</li>
                    <li>Open <code>backend/.env</code></li>
                    <li>Set <code>GEMINI_API_KEY=your_key_here</code></li>
                    <li>Restart the Flask backend</li>
                  </ol>
                </div>
              )}
              {aiError.type === "quota_exceeded" && (
                <div className="ai-error-steps">
                  <p className="ai-error-steps-title">Quick steps:</p>
                  <ol>
                    <li>Wait 1–2 minutes for the rate limit to reset</li>
                    <li>Or check your quota at <strong>aistudio.google.com</strong></li>
                    <li>Click Retry when ready</li>
                  </ol>
                </div>
              )}
              <button
                className="retry-btn"
                style={{ background: meta.color }}
                onClick={() => { setClinicalData(null); setAiError(null); }}
              >
                <i className="ri-refresh-line" /> Try Again
              </button>
            </div>
          </div>
        );
      })()}

      {activeTab === "insights" && _cd && (
        <>
          <div className="alerts-section">
            <h3 className="section-title">
              <i className="ri-alarm-warning-line"></i>
              Critical Alerts Requiring Attention
            </h3>
            
            {_cd.criticalAlerts.map((alert) => (
              <div key={alert.id} className={`alert-card severity-${alert.severity}`}>
                <div className="alert-header">
                  <div className="alert-title-row">
                    <h4>{alert.title}</h4>
                    <span className={`severity-badge ${alert.severity}`}>
                      {alert.severity.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <div className="alert-meta">
                    <span className="probability">
                      <i className="ri-percent-line"></i>
                      {alert.probability}% probability
                    </span>
                    <span className="timeframe">
                      <i className="ri-time-line"></i>
                      {alert.timeframe}
                    </span>
                  </div>
                </div>

                <div className="alert-body">
                  <div className="reasoning-section">
                    <strong>AI Reasoning:</strong>
                    <ul>
                      {alert.reasoning.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="recommendation-box">
                    <strong>
                      <i className="ri-medical-book-line"></i>
                      Clinical Recommendation:
                    </strong>
                    <p>{alert.recommendation}</p>
                  </div>

                  <div className="evidence-footer">
                    <i className="ri-file-chart-line"></i>
                    {alert.evidenceBased}
                  </div>
                </div>

                <div className="alert-actions">
                  <button className="action-btn primary">
                    <i className="ri-edit-line"></i>
                    Add to Care Plan
                  </button>
                  <button className="action-btn secondary">
                    <i className="ri-calendar-event-line"></i>
                    Schedule Follow-up
                  </button>
                  <button className="action-btn tertiary">
                    <i className="ri-mail-send-line"></i>
                    Notify Parent
                  </button>
                </div>
              </div>
            ))}
          </div>

         
          <div className="red-flags-section">
            <h3 className="section-title">
              <i className="ri-flag-line"></i>
              Red Flags & Monitoring Points
            </h3>
            
            {_cd.redFlags.map((flag, idx) => (
              <div key={idx} className="red-flag-item">
                <div className="flag-icon">⚠️</div>
                <div className="flag-content">
                  <h4>{flag.flag}</h4>
                  <p><strong>Details:</strong> {flag.details}</p>
                  <p><strong>Action Required:</strong> {flag.action}</p>
                </div>
                <span className={`flag-status ${flag.status.toLowerCase()}`}>
                  {flag.status}
                </span>
              </div>
            ))}
          </div>

        
          <div className="recommendations-grid">
            <h3 className="section-title">
              <i className="ri-ai-generate"></i>
              AI-Generated Action Items
            </h3>
            
            {_cd.aiRecommendations.map((rec, idx) => (
              <div key={idx} className={`recommendation-card priority-${rec.priority.toLowerCase()}`}>
                <div className="rec-header">
                  <span className={`rec-type ${rec.type.toLowerCase()}`}>
                    {rec.type}
                  </span>
                  <span className={`rec-priority ${rec.priority.toLowerCase()}`}>
                    {rec.priority} Priority
                  </span>
                </div>
                
                <h4>{rec.title}</h4>
                <p className="rec-rationale">{rec.rationale}</p>
                
                <div className="rec-footer">
                  <span className="rec-timing">
                    <i className="ri-timer-line"></i>
                    {rec.timing}
                  </span>
                  {rec.automated && (
                    <span className="automated-badge">
                      <i className="ri-robot-line"></i>
                      Can be automated
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

  
      {activeTab === "diagnostics" && _cd && (
        <div className="diagnostics-section">
          <h3 className="section-title">
            <i className="ri-stethoscope-line"></i>
            AI-Assisted Differential Diagnosis
          </h3>

          {_cd.diagnosticSupport.map((diag, idx) => (
            <div key={idx} className="diagnostic-card">
              <h4 className="diag-title">{diag.symptomCluster}</h4>
              
              <div className="diagnosis-list">
                <strong>Ranked Differential Diagnoses:</strong>
                {diag.likelyDiagnoses.map((dx, i) => (
                  <div key={i} className="diagnosis-item">
                    <div className="dx-info">
                      <span className="dx-rank">#{i + 1}</span>
                      <span className="dx-name">{dx.condition}</span>
                      <span className={`dx-confidence ${dx.confidence.toLowerCase()}`}>
                        {dx.confidence} Confidence
                      </span>
                    </div>
                    <div className="dx-probability">
                      <div className="probability-bar">
                        <div 
                          className="probability-fill" 
                          style={{ width: `${dx.probability}%` }}
                        ></div>
                      </div>
                      <span>{dx.probability}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="differential-factors">
                <strong>Key Differential Factors:</strong>
                <ul>
                  {diag.differentialFactors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </div>

              <div className="suggested-tests">
                <strong>
                  <i className="ri-test-tube-line"></i>
                  Suggested Investigations:
                </strong>
                <div className="test-chips">
                  {diag.suggestedTests.map((test, i) => (
                    <span key={i} className="test-chip">{test}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="medication-analysis">
            <h3 className="section-title">
              <i className="ri-medicine-bottle-line"></i>
              Medication Effectiveness Analysis
            </h3>

            {_cd.medicationAnalysis.currentMedications.map((med, idx) => (
              <div key={idx} className="med-analysis-card">
                <div className="med-header">
                  <h4>{med.name}</h4>
                  <span className={`effectiveness-badge ${med.effectiveness.toLowerCase()}`}>
                    {med.effectiveness} Effectiveness
                  </span>
                </div>

                <div className="med-metrics">
                  <div className="metric">
                    <span className="metric-label">Adherence Rate</span>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill adherence" 
                        style={{ width: `${med.adherence}%` }}
                      ></div>
                    </div>
                    <span className="metric-value">{med.adherence}%</span>
                  </div>
                </div>

                <div className="ai-insight-box">
                  <i className="ri-lightbulb-flash-line"></i>
                  <strong>AI Insight:</strong> {med.aiInsight}
                </div>

                <div className="duration-analysis">
                  <i className="ri-calendar-2-line"></i>
                  {med.durationAnalysis}
                </div>
              </div>
            ))}

            {_cd.medicationAnalysis.alternatives.length > 0 && (
              <div className="alternatives-section">
                <strong>Alternative Treatment Considerations:</strong>
                {_cd.medicationAnalysis.alternatives.map((alt, idx) => (
                  <div key={idx} className="alternative-card">
                    <p><strong>Suggestion:</strong> {alt.suggestion}</p>
                    <p><strong>AI Reasoning:</strong> {alt.reasoning}</p>
                    <p><strong>Cost-Benefit:</strong> {alt.costBenefit}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}


      {activeTab === "patterns" && _cd && (
        <div className="patterns-section">
          <h3 className="section-title">
            <i className="ri-line-chart-line"></i>
            AI Pattern Recognition & Correlations
          </h3>

          {_cd.patternRecognition.map((pattern, idx) => (
            <div key={idx} className="pattern-card">
              <div className="pattern-header">
                <h4>{pattern.pattern}</h4>
                <span className="confidence-score">
                  {pattern.confidence}% confidence
                </span>
              </div>

              <div className="pattern-finding">
                <strong>Finding:</strong>
                <p>{pattern.finding}</p>
              </div>

              <div className="pattern-visual">
                <i className="ri-bar-chart-box-line"></i>
                <span>{pattern.visualData}</span>
              </div>

              <div className="pattern-action">
                <strong>
                  <i className="ri-pulse-line"></i>
                  Clinical Action:
                </strong>
                <p>{pattern.clinicalAction}</p>
              </div>
            </div>
          ))}

          <div className="population-section">
            <h3 className="section-title">
              <i className="ri-group-line"></i>
              Population-Based Insights
              <span className="cohort-size">Based on {_cd.populationComparison.similarCases} similar cases</span>
            </h3>

            <div className="comparison-grid">
              {_cd.populationComparison.outcomeData.map((outcome, idx) => (
                <div key={idx} className="comparison-card">
                  <h5>{outcome.metric}</h5>
                  <div className="comparison-bars">
                    <div className="comparison-item">
                      <span>This Patient</span>
                      <div className="comp-bar">
                        <div 
                          className="comp-fill patient" 
                          style={{ width: `${outcome.thisPatient}%` }}
                        ></div>
                      </div>
                      <span>{outcome.thisPatient}</span>
                    </div>
                    <div className="comparison-item">
                      <span>Cohort Avg</span>
                      <div className="comp-bar">
                        <div 
                          className="comp-fill cohort" 
                          style={{ width: `${outcome.cohortAverage}%` }}
                        ></div>
                      </div>
                      <span>{outcome.cohortAverage}</span>
                    </div>
                  </div>
                  <span className={`status-badge ${outcome.status.toLowerCase().replace(' ', '-')}`}>
                    {outcome.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="success-protocols">
              <strong>Evidence-Based Insights from Similar Cases:</strong>
              <ul>
                {_cd.populationComparison.successfulProtocols.map((protocol, idx) => (
                  <li key={idx}>
                    <i className="ri-check-line"></i>
                    {protocol}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

    
      {activeTab === "compliance" && _cd && (
        <div className="compliance-section">
          <h3 className="section-title">
            <i className="ri-checkbox-circle-line"></i>
            Treatment Compliance & Adherence Analysis
          </h3>

          <div className="compliance-overview">
            <div className="compliance-score-card">
              <div className="score-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="8"
                    strokeDasharray={`${_cd.complianceInsights.overallAdherence * 2.827} 283`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="score-text">
                  <span className="score-number">{_cd.complianceInsights.overallAdherence}%</span>
                  <span className="score-label">Overall Adherence</span>
                </div>
              </div>
              
              <div className="compliance-stats">
                <div className="stat">
                  <i className="ri-check-double-line"></i>
                  <span>{100 - _cd.complianceInsights.missedDoses} doses completed</span>
                </div>
                <div className="stat missed">
                  <i className="ri-close-circle-line"></i>
                  <span>{_cd.complianceInsights.missedDoses} doses missed</span>
                </div>
              </div>
            </div>

            <div className="compliance-patterns">
              <h4>AI-Identified Compliance Patterns</h4>
              {_cd.complianceInsights.patterns.map((pattern, idx) => (
                <div key={idx} className="compliance-pattern-item">
                  <div className="pattern-issue">
                    <i className="ri-alert-line"></i>
                    <strong>{pattern.issue}</strong>
                  </div>
                  <p>{pattern.frequency}</p>
                  <div className="pattern-suggestion">
                    <i className="ri-lightbulb-line"></i>
                    Suggestion: {pattern.suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="parent-engagement-card">
            <h4>
              <i className="ri-parent-line"></i>
              Parent Engagement Analysis
            </h4>
            
            <div className="engagement-grid">
              <div className="engagement-item">
                <span className="eng-label">App Usage</span>
                <span className="eng-value good">{_cd.complianceInsights.parentEngagement.appUsage}</span>
              </div>
              <div className="engagement-item">
                <span className="eng-label">Log Completeness</span>
                <span className="eng-value good">{_cd.complianceInsights.parentEngagement.logCompleteness}%</span>
              </div>
              <div className="engagement-item">
                <span className="eng-label">Response Time</span>
                <span className="eng-value good">{_cd.complianceInsights.parentEngagement.responseTime}</span>
              </div>
            </div>

            <div className="engagement-assessment">
              <strong>AI Assessment:</strong>
              <p>{_cd.complianceInsights.parentEngagement.concernLevel}</p>
            </div>
          </div>
        </div>
      )}


      {activeTab === "growth-prediction" && (
        <div className="growth-pred-section">
          <GrowthPredictionChart selectedChild={selectedChild} />
        </div>
      )}

      {_cd && <div className="literature-section">

        {_cd.literatureInsights.map((lit, idx) => (
          <div key={idx} className="literature-card">
            <div className="lit-header">
              <h4>{lit.topic}</h4>
              <span className={`relevance-badge ${lit.relevance.split(' ')[0].toLowerCase()}`}>
                {lit.relevance}
              </span>
            </div>
            
            <p className="lit-finding">{lit.finding}</p>
            
            <div className="lit-footer">
              <span className="citation">
                <i className="ri-file-text-line"></i>
                {lit.citation}
              </span>
              <button className="lit-action">
                <i className="ri-arrow-right-line"></i>
                {lit.action}
              </button>
            </div>
          </div>
        ))}
      </div>}

      <div className="ai-disclaimer">
        <i className="ri-information-line"></i>
        <p>
          <strong>Clinical Decision Support Tool:</strong> AI-generated insights are intended to augment, 
          not replace, clinical judgment. All recommendations should be evaluated in the context of individual 
          patient circumstances and professional medical expertise.
        </p>
      </div>
    </div>
  );
}