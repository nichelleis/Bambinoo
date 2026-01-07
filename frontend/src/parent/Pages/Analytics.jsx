import { useState, useEffect } from 'react';
import Plot from 'plotly.js-basic-dist';
import styles from './Analytics.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function Analytics() {
  const [childData, setChildData] = useState(null);
  const [vaccineRecords, setVaccineRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  