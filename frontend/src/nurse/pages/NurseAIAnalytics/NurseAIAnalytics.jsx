import "./NurseAIAnalytics";
import React, { useState } from "react";
import GrowthPredictionChart from "../../../components/GrowthPredictionChart";


export default function AIAnalytics({ selectedChild }) {
  const [activeTab, setActiveTab] = useState("insights");


  const clinicalData = {
    aiConfidence: 87,
    lastAnalyzed: "15 minutes ago",
    dataPoints: 247,
    
    criticalAlerts: [
      {
        id: 1,
        severity: "high",
        title: "Potential Asthma Exacerbation Risk",
        probability: 78,
        timeframe: "Next 48-72 hours",
        reasoning: [
          "Recent increase in rescue inhaler usage (3x in past week)",
          "Weather forecast shows high pollen count",
          "Patient history shows seasonal pattern",
          "Sleep disturbance reported by parent"
        ],
        recommendation: "Consider adjusting controller medication dosage. Schedule telehealth check-in within 24 hours.",
        evidenceBased: "Based on 15,000+ similar pediatric cases"
      },
      {
        id: 2,
        severity: "medium",
        title: "Growth Trajectory Deviation",
        probability: 65,
        timeframe: "Current assessment",
        reasoning: [
          "Weight gain slower than expected (5th percentile drop)",
          "No corresponding height velocity change",
          "Appetite decrease noted in parent logs",
          "No acute illness reported"
        ],
        recommendation: "Review nutritional intake. Consider dietary consultation if pattern continues for 2 more weeks.",
        evidenceBased: "WHO growth chart analysis + ML pattern recognition"
      }
    ],

    diagnosticSupport: [
      {
        symptomCluster: "Skin Inflammation Pattern",
        likelyDiagnoses: [
          { condition: "Atopic Dermatitis (Eczema)", probability: 89, confidence: "High" },
          { condition: "Contact Dermatitis", probability: 45, confidence: "Medium" },
          { condition: "Psoriasis (Pediatric)", probability: 12, confidence: "Low" }
        ],
        differentialFactors: [
          "Distribution pattern: flexural areas (elbows, knees) - consistent with atopic dermatitis",
          "Family history of allergies present",
          "Age of onset: 2 years - typical for eczema",
          "Response to emollients: positive"
        ],
        suggestedTests: [
          "IgE levels (if not recently tested)",
          "Patch testing if contact dermatitis suspected"
        ]
      }
    ],

    medicationAnalysis: {
      currentMedications: [
        {
          name: "Cetirizine 5ml",
          adherence: 85,
          effectiveness: "Good",
          sideEffects: "None reported",
          aiInsight: "Optimal dosing. Adherence pattern shows weekend gaps - consider parent reminder system.",
          durationAnalysis: "Long-term use (8 months) - Review need for continuation vs seasonal use"
        }
      ],
      interactions: [],
      alternatives: [
        {
          suggestion: "Consider switching to leukotriene inhibitor if control inadequate",
          reasoning: "Better long-term outcomes in 62% of similar cases",
          costBenefit: "Higher cost but improved compliance due to once-daily dosing"
        }
      ]
    },

    patternRecognition: [
      {
        pattern: "Symptom Spike Correlation",
        finding: "Eczema flare-ups correlate 83% with dairy consumption",
        visualData: "Peaks observed 24-48 hours post consumption",
        clinicalAction: "Consider elimination diet trial or food allergy testing",
        confidence: 83
      },
      {
        pattern: "Seasonal Trend",
        finding: "Respiratory symptoms increase 340% during spring months",
        visualData: "March-May historical data shows consistent pattern",
        clinicalAction: "Prophylactic antihistamine starting February may reduce severity",
        confidence: 91
      },
      {
        pattern: "Nocturnal Symptom Pattern",
        finding: "Sleep disruption correlates with symptom severity",
        visualData: "Sleep quality score drops from 8/10 to 4/10 during flare-ups",
        clinicalAction: "Address nighttime symptom management - consider evening medication timing",
        confidence: 76
      }
    ],

    complianceInsights: {
      overallAdherence: 78,
      missedDoses: 22,
      patterns: [
        { issue: "Weekend Gaps", frequency: "40% of missed doses occur Sat-Sun", suggestion: "Weekend reminder protocol" },
        { issue: "Evening Doses", frequency: "35% of missed doses are PM medications", suggestion: "Bedtime routine integration" }
      ],
      parentEngagement: {
        appUsage: "Daily",
        logCompleteness: 85,
        responseTime: "Usually within 4 hours",
        concernLevel: "Appropriate - proactive but not anxious"
      }
    },

    populationComparison: {
      similarCases: 1247,
      outcomeData: [
        {
          metric: "Symptom Control",
          thisPatient: 72,
          cohortAverage: 68,
          status: "Above average"
        },
        {
          metric: "Treatment Response",
          thisPatient: 81,
          cohortAverage: 75,
          status: "Above average"
        },
        {
          metric: "Quality of Life Score",
          thisPatient: 7.8,
          cohortAverage: 7.2,
          status: "Above average"
        }
      ],
      successfulProtocols: [
        "Step-down therapy achieved in 67% of similar cases after 6 months",
        "Combining skin barrier therapy with antihistamines shows 23% better outcomes"
      ]
    },

    aiRecommendations: [
      {
        type: "Clinical Action",
        priority: "High",
        title: "Schedule In-Person Examination",
        rationale: "AI flags require clinical confirmation. Respiratory rate pattern needs assessment.",
        timing: "Within 5-7 days",
        automated: false
      },
      {
        type: "Preventive",
        priority: "Medium",
        title: "Update Asthma Action Plan",
        rationale: "Current plan is 8 months old. Recent pattern changes warrant revision.",
        timing: "Next scheduled visit",
        automated: true
      },
      {
        type: "Educational",
        priority: "Medium",
        title: "Parent Education: Trigger Management",
        rationale: "AI identifies knowledge gaps in environmental control measures",
        timing: "Send resources via portal",
        automated: true
      },
      {
        type: "Referral",
        priority: "Low",
        title: "Allergist Consultation (Optional)",
        rationale: "Complex multi-system involvement may benefit from specialist input",
        timing: "Consider if no improvement in 8 weeks",
        automated: false
      }
    ],

    redFlags: [
      {
        flag: "Increasing Inhaler Dependency",
        status: "Monitor",
        details: "Rescue inhaler use increased from 1x/week to 3x/week",
        action: "If continues for 2 more weeks, step up controller therapy"
      }
    ],

    literatureInsights: [
      {
        topic: "Pediatric Eczema Management",
        finding: "Recent RCT shows wet wrap therapy reduces flare severity by 45%",
        relevance: "High - applicable to this patient",
        citation: "J Pediatr Dermatol. 2025;15(2):234-241",
        action: "Consider recommending to parents"
      }
    ]
  };

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
            <span>{clinicalData.dataPoints} data points analyzed</span>
          </div>
          <div className="meta-badge">
            <i className="ri-refresh-line"></i>
            <span>{clinicalData.lastAnalyzed}</span>
          </div>
          <div className="confidence-badge">
            AI Confidence: {clinicalData.aiConfidence}%
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
          className={activeTab === "growth" ? "tab active" : "tab"}
          onClick={() => setActiveTab("growth")}
        >
          <i className="ri-line-chart-line"></i>
          Growth Prediction
        </button>
      </div>

      {activeTab === "insights" && (
        <>
          <div className="alerts-section">
            <h3 className="section-title">
              <i className="ri-alarm-warning-line"></i>
              Critical Alerts Requiring Attention
            </h3>
            
            {clinicalData.criticalAlerts.map((alert) => (
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
            
            {clinicalData.redFlags.map((flag, idx) => (
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
            
            {clinicalData.aiRecommendations.map((rec, idx) => (
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

  
      {activeTab === "diagnostics" && (
        <div className="diagnostics-section">
          <h3 className="section-title">
            <i className="ri-stethoscope-line"></i>
            AI-Assisted Differential Diagnosis
          </h3>

          {clinicalData.diagnosticSupport.map((diag, idx) => (
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

            {clinicalData.medicationAnalysis.currentMedications.map((med, idx) => (
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

            {clinicalData.medicationAnalysis.alternatives.length > 0 && (
              <div className="alternatives-section">
                <strong>Alternative Treatment Considerations:</strong>
                {clinicalData.medicationAnalysis.alternatives.map((alt, idx) => (
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


      {activeTab === "patterns" && (
        <div className="patterns-section">
          <h3 className="section-title">
            <i className="ri-line-chart-line"></i>
            AI Pattern Recognition & Correlations
          </h3>

          {clinicalData.patternRecognition.map((pattern, idx) => (
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
              <span className="cohort-size">Based on {clinicalData.populationComparison.similarCases} similar cases</span>
            </h3>

            <div className="comparison-grid">
              {clinicalData.populationComparison.outcomeData.map((outcome, idx) => (
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
                {clinicalData.populationComparison.successfulProtocols.map((protocol, idx) => (
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

    
      {activeTab === "compliance" && (
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
                    strokeDasharray={`${clinicalData.complianceInsights.overallAdherence * 2.827} 283`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="score-text">
                  <span className="score-number">{clinicalData.complianceInsights.overallAdherence}%</span>
                  <span className="score-label">Overall Adherence</span>
                </div>
              </div>
              
              <div className="compliance-stats">
                <div className="stat">
                  <i className="ri-check-double-line"></i>
                  <span>{100 - clinicalData.complianceInsights.missedDoses} doses completed</span>
                </div>
                <div className="stat missed">
                  <i className="ri-close-circle-line"></i>
                  <span>{clinicalData.complianceInsights.missedDoses} doses missed</span>
                </div>
              </div>
            </div>

            <div className="compliance-patterns">
              <h4>AI-Identified Compliance Patterns</h4>
              {clinicalData.complianceInsights.patterns.map((pattern, idx) => (
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
                <span className="eng-value good">{clinicalData.complianceInsights.parentEngagement.appUsage}</span>
              </div>
              <div className="engagement-item">
                <span className="eng-label">Log Completeness</span>
                <span className="eng-value good">{clinicalData.complianceInsights.parentEngagement.logCompleteness}%</span>
              </div>
              <div className="engagement-item">
                <span className="eng-label">Response Time</span>
                <span className="eng-value good">{clinicalData.complianceInsights.parentEngagement.responseTime}</span>
              </div>
            </div>

            <div className="engagement-assessment">
              <strong>AI Assessment:</strong>
              <p>{clinicalData.complianceInsights.parentEngagement.concernLevel}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "growth" && (
        <div className="gpc-tab-section">
          <h3 className="section-title">
            <i className="ri-line-chart-line"></i>
            ML Growth Prediction
          </h3>
          <GrowthPredictionChart selectedChild={selectedChild} />
        </div>
      )}


      <div className="literature-section">
        <h3 className="section-title">
          <i className="ri-book-open-line"></i>
          Relevant Recent Literature
        </h3>

        {clinicalData.literatureInsights.map((lit, idx) => (
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
      </div>

    
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