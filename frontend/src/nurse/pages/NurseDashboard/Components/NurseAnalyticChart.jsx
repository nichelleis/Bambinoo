import "./NurseAnalyticChart.css";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const STATIC_DATA = [
  { month: "Jan", height: 85, weight: 12 },
  { month: "Feb", height: 87, weight: 12.5 },
  { month: "Mar", height: 89, weight: 13 },
  { month: "Apr", height: 91, weight: 13.6 },
  { month: "May", height: 93, weight: 14 },
  { month: "Jun", height: 95, weight: 14.5 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="nac-tooltip">
        <p className="nac-tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="nac-tooltip-value">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const formatRecordDate = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const buildChartData = (child) => {
  if (!child?.growthHistory?.length) return null;
  const mapped = [...child.growthHistory]
    .filter((r) => r.weight != null)
    .sort((a, b) => new Date(a.record_date) - new Date(b.record_date))
    .map((r) => ({
      month: formatRecordDate(r.record_date),
      weight: r.weight,
    }));
  return mapped.length > 0 ? mapped : null;
};

const NurseAnalyticChart = () => {
  const [chartData, setChartData] = useState(STATIC_DATA);
  const [selectedChild, setSelectedChild] = useState(null);

  const loadFromStorage = () => {
    const stored = localStorage.getItem("selectedChild");
    if (stored) {
      const child = JSON.parse(stored);
      setSelectedChild(child);
      const data = buildChartData(child);
      setChartData(data || STATIC_DATA);
    } else {
      setSelectedChild(null);
      setChartData(STATIC_DATA);
    }
  };

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    window.addEventListener("storage", loadFromStorage);
    return () => window.removeEventListener("storage", loadFromStorage);
  }, []);

  const isChildSelected = !!selectedChild;

  return (
    <div className="nac-container">
      <div className="nac-header">
        <div className="nac-header-left">
          <h3 className="nac-title">
            {isChildSelected
              ? `Weight Trend — ${selectedChild.name}`
              : "Child Growth Trends"}
          </h3>
          <p className="nac-subtitle">
            {isChildSelected
              ? "Weight (kg) over all recorded visits"
              : "Height (cm) & Weight (kg) — sample data"}
          </p>
        </div>

        {isChildSelected ? (
          <span className="nac-badge nac-badge--active">
            📊 {selectedChild.name}
          </span>
        ) : (
          <span className="nac-badge nac-badge--empty">
            No child selected
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(194,96,122,0.1)" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#9c7080", fontSize: 11, fontFamily: "Lato, sans-serif" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#9c7080", fontSize: 11, fontFamily: "Lato, sans-serif" }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: "0.72rem", color: "#9c7080", fontFamily: "Lato, sans-serif" }}
          />

          <Line
            type="monotone"
            dataKey="weight"
            stroke="#c2607a"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "#c2607a", strokeWidth: 0 }}
            activeDot={{ r: 5.5, fill: "#a8485f" }}
            name="Weight (kg)"
          />

          {!isChildSelected && (
            <Line
              type="monotone"
              dataKey="height"
              stroke="#3b7dd8"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "#3b7dd8", strokeWidth: 0 }}
              activeDot={{ r: 5.5, fill: "#2e5fa8" }}
              name="Height (cm)"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NurseAnalyticChart;
