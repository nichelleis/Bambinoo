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

