import { useState, useEffect } from 'react';
import Plot from 'plotly.js-basic-dist';
import styles from './Analytics.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function Analytics() {
  const [childData, setChildData] = useState(null);
  const [vaccineRecords, setVaccineRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  // Fetch data from backend
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

