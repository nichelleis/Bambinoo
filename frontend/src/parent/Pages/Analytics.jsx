import { useState, useEffect } from 'react';
import Plotly from 'plotly.js-dist';
import styles from '../../assets/styleSheets/Analytics.module.css';


function Analytics() {
  const [childData, setChildData] = useState(null);
  const [vaccineRecords, setVaccineRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);
  
  useEffect(() => {
    fetchChildData();
    fetchVaccineRecords();
  }, []);

  const fetchChildData = async () => {
    try {

      // Mock data
      const mockData = {
        id: 1,
        name: "John Doe",
        age: 5,
        gender: "Male",
        measurements: [
          { date: "2024-01", height: 100, weight: 15 },
          { date: "2024-04", height: 105, weight: 16.5 },
          { date: "2024-07", height: 108, weight: 17.2 },
          { date: "2024-10", height: 110, weight: 18 },
          { date: "2025-01", height: 112, weight: 18.5 }
        ]
      };

      setChildData(mockData);
      setSelectedChild(mockData.id);
    } catch (error) {
      console.error("Error fetching child data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccineRecords = async () => {
    try {
      // Mock data 
      const mockVaccines = [
        { id: 1, vaccine: "BCG", date: "2020-02-15", status: "Completed", nextDue: "-" },
        { id: 2, vaccine: "Hepatitis B", date: "2020-03-10", status: "Completed", nextDue: "-" },
        { id: 3, vaccine: "DTP", date: "2020-05-20", status: "Completed", nextDue: "2025-05-20" },
        { id: 4, vaccine: "Polio", date: "2020-05-20", status: "Completed", nextDue: "2025-05-20" },
        { id: 5, vaccine: "MMR", date: "2021-02-15", status: "Completed", nextDue: "2026-02-15" },
        { id: 6, vaccine: "Varicella", date: "2021-08-10", status: "Completed", nextDue: "-" },
        { id: 7, vaccine: "HPV", date: "-", status: "Pending", nextDue: "2025-06-15" }
      ];

      setVaccineRecords(mockVaccines);
    } catch (error) {
      console.error("Error fetching vaccine records:", error);
    }
  };

  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
  };

  const getBMIRiskLevel = (bmi, age) => {
    if (bmi < 14) return { level: "Severe Underweight", color: "#dc2626" };
    if (bmi < 15) return { level: "Underweight", color: "#f59e0b" };
    if (bmi < 17) return { level: "Normal", color: "#10b981" };
    if (bmi < 18) return { level: "Overweight", color: "#f59e0b" };
    return { level: "Obese", color: "#dc2626" };
  };

  useEffect(() => {
    if (!childData || !childData.measurements) return;

    const dates = childData.measurements.map(m => m.date);
    const heights = childData.measurements.map(m => m.height);
    const weights = childData.measurements.map(m => m.weight);
    const bmis = childData.measurements.map(m =>
      calculateBMI(m.weight, m.height)
    );

    const heightChart = {
      data: [
        {
          x: dates,
          y: heights,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Child Height',
          line: { color: '#3b82f6', width: 3 },
          marker: { size: 10, color: '#3b82f6' }
        },
        {
          x: dates,
          y: dates.map(() => 115),
          type: 'scatter',
          mode: 'lines',
          name: '95th Percentile',
          line: { color: '#10b981', dash: 'dash', width: 2 }
        },
        {
          x: dates,
          y: dates.map(() => 107),
          type: 'scatter',
          mode: 'lines',
          name: '50th Percentile',
          line: { color: '#f59e0b', dash: 'dot', width: 2 }
        },
        {
          x: dates,
          y: dates.map(() => 100),
          type: 'scatter',
          mode: 'lines',
          name: '5th Percentile',
          line: { color: '#dc2626', dash: 'dash', width: 2 }
        }
      ],
      layout: {
        title: 'Height Growth Chart (cm)',
        xaxis: { title: 'Date' },
        yaxis: { title: 'Height (cm)' },
        hovermode: 'closest',
        showlegend: true,
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff'
      }
    };

    const weightChart = {
      data: [
        {
          x: dates,
          y: weights,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Child Weight',
          line: { color: '#8b5cf6', width: 3 },
          marker: { size: 10, color: '#8b5cf6' }
        },
        {
          x: dates,
          y: dates.map(() => 20),
          type: 'scatter',
          mode: 'lines',
          name: '95th Percentile',
          line: { color: '#10b981', dash: 'dash', width: 2 }
        },
        {
          x: dates,
          y: dates.map(() => 17),
          type: 'scatter',
          mode: 'lines',
          name: '50th Percentile',
          line: { color: '#f59e0b', dash: 'dot', width: 2 }
        },
        {
          x: dates,
          y: dates.map(() => 14),
          type: 'scatter',
          mode: 'lines',
          name: '5th Percentile',
          line: { color: '#dc2626', dash: 'dash', width: 2 }
        }
      ],
      layout: {
        title: 'Weight Growth Chart (kg)',
        xaxis: { title: 'Date' },
        yaxis: { title: 'Weight (kg)' },
        hovermode: 'closest',
        showlegend: true,
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff'
      }
    };

    const bmiColors = bmis.map(bmi => {
      const risk = getBMIRiskLevel(parseFloat(bmi), childData.age);
      return risk.color;
    });

    const bmiChart = {
      data: [
        {
          x: dates,
          y: bmis,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'BMI',
          line: { color: '#ec4899', width: 3 },
          marker: {
            size: 12,
            color: bmiColors,
            line: { color: '#fff', width: 2 }
          }
        },
        {
          x: dates,
          y: dates.map(() => 18),
          type: 'scatter',
          mode: 'lines',
          name: 'Obese (>18)',
          line: { color: '#dc2626', dash: 'dash', width: 2 },
          fill: 'tonexty',
          fillcolor: 'rgba(220, 38, 38, 0.1)'
        },
        {
          x: dates,
          y: dates.map(() => 17),
          type: 'scatter',
          mode: 'lines',
          name: 'Overweight (17-18)',
          line: { color: '#f59e0b', dash: 'dash', width: 2 },
          fill: 'tonexty',
          fillcolor: 'rgba(245, 158, 11, 0.1)'
        },
        {
          x: dates,
          y: dates.map(() => 15),
          type: 'scatter',
          mode: 'lines',
          name: 'Normal (15-17)',
          line: { color: '#10b981', dash: 'dash', width: 2 },
          fill: 'tonexty',
          fillcolor: 'rgba(16, 185, 129, 0.1)'
        },
        {
          x: dates,
          y: dates.map(() => 14),
          type: 'scatter',
          mode: 'lines',
          name: 'Underweight (<15)',
          line: { color: '#f59e0b', dash: 'dash', width: 2 },
          fill: 'tonexty',
          fillcolor: 'rgba(245, 158, 11, 0.1)'
        }
      ],
      layout: {
        title: 'BMI Chart with Risk Levels',
        xaxis: { title: 'Date' },
        yaxis: { title: 'BMI' },
        hovermode: 'closest',
        showlegend: true,
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff'
      }
    };

    Plotly.newPlot('heightChart', heightChart.data, heightChart.layout, { responsive: true });
    Plotly.newPlot('weightChart', weightChart.data, weightChart.layout, { responsive: true });
    Plotly.newPlot('bmiChart', bmiChart.data, bmiChart.layout, { responsive: true });

  }, [childData]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading analytics data...</p>
      </div>
    );
  }

  const latestMeasurement = childData?.measurements[childData.measurements.length - 1];
  const latestBMI = latestMeasurement ? calculateBMI(latestMeasurement.weight, latestMeasurement.height) : 0;
  const riskLevel = latestMeasurement ? getBMIRiskLevel(parseFloat(latestBMI), childData.age) : null;

  return (
    <div className={styles.analyticsContainer}>
      <div className="container-fluid">
        <div className={styles.headerCard}>
          <div className={styles.animatedBackground}>
            <div className={styles.floatingCircle} style={{ top: '10%', left: '15%' }}></div>
            <div className={styles.floatingCircle} style={{ top: '60%', right: '10%' }}></div>
            <div className={styles.floatingCircle} style={{ bottom: '15%', left: '40%' }}></div>
          </div>
          <div className={styles.headerContent}>
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className={styles.headerIconWrapper}>
                  <span className={styles.headerIcon}>✨</span>
                </div>
                <h1 className={styles.mainTitle}>Analytics Dashboard</h1>
                <p className={styles.subtitle}>Track {childData?.name}'s amazing growth</p>
                <div className={styles.childDetails}>
                  <span className={styles.detailBadge}>
                    <i className="bi bi-person-fill me-2"></i>
                    {childData?.age} years old
                  </span>
                  <span className={styles.detailBadge}>
                    <i className="bi bi-gender-ambiguous me-2"></i>
                    {childData?.gender}
                  </span>
                </div>
              </div>
              <div className="col-md-4">
                <div className={styles.updateInfo}>
                  <div className={styles.updateIconCircle}>
                    <i className="bi bi-clock-history"></i>
                  </div>
                  <p className={styles.updateLabel}>Last Updated</p>
                  <p className={styles.updateDate}>{latestMeasurement?.date}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className={`card ${styles.statCard} ${styles.heightCard}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className={styles.statLabel}>Current Height</p>
                    <p className={styles.statValue}>{latestMeasurement?.height}</p>
                    <p className={styles.statUnit}>cm</p>
                  </div>
                  <div className={styles.iconContainer}>
                    <i className="bi bi-arrow-up-circle-fill"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className={`card ${styles.statCard} ${styles.weightCard}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className={styles.statLabel}>Current Weight</p>
                    <p className={styles.statValue}>{latestMeasurement?.weight}</p>
                    <p className={styles.statUnit}>kg</p>
                  </div>
                  <div className={styles.iconContainer}>
                    <i className="bi bi-speedometer2"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className={`card ${styles.statCard} ${styles.bmiCard}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className={styles.statLabel}>Current BMI</p>
                    <p className={styles.statValue}>{latestBMI}</p>
                    <p className={styles.statUnit}>kg/m²</p>
                  </div>
                  <div className={styles.iconContainer}>
                    <i className="bi bi-bar-chart-fill"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className={`card ${styles.statCard} ${styles.statusCard}`}>
              <div className="card-body">
                <p className={styles.statLabel}>Health Status</p>
                <p className={styles.riskLevel} style={{ color: riskLevel?.color }}>
                  {riskLevel?.level}
                </p>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      backgroundColor: riskLevel?.color,
                      width: riskLevel?.level === "Normal" ? "80%" : "40%"
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className={`card ${styles.chartCard}`}>
              <div className="card-body">
                <div id="heightChart" className={styles.chartContainer}></div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className={`card ${styles.chartCard}`}>
              <div className="card-body">
                <div id="weightChart" className={styles.chartContainer}></div>
              </div>
            </div>
          </div>
        </div>

        <div className={`card ${styles.chartCard} mb-4`}>
          <div className="card-body">
            <div id="bmiChart" className={styles.chartContainer}></div>
          </div>
        </div>

        <div className={`card ${styles.vaccineCard}`}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className={styles.sectionTitle}>Vaccination Records</h2>
            </div>

            <div className="table-responsive">
              <table className={`table ${styles.vaccineTable}`}>
                <thead>
                  <tr>
                    <th>Vaccine</th>
                    <th>Date Given</th>
                    <th>Status</th>
                    <th>Next Due</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccineRecords.map((record) => (
                    <tr key={record.id}>
                      <td className={styles.vaccineName}>{record.vaccine}</td>
                      <td>{record.date}</td>
                      <td>
                        <span className={`badge ${record.status === 'Completed'
                            ? styles.badgeCompleted
                            : styles.badgePending
                          }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className={record.nextDue === '-' ? styles.noDueDate : styles.dueDate}>
                        {record.nextDue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
