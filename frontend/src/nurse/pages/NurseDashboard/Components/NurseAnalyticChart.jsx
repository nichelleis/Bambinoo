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
      <div
        style={{
          background: "rgba(15,16,28,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "10px",
          padding: "0.6rem 0.9rem",
          fontSize: "0.72rem",
          color: "#f1f5f9",
        }}
      >
        <p style={{ marginBottom: "0.3rem", fontWeight: 600 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
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
  const mapped = child.growthHistory
    .filter((r) => r.weight != null)
    .map((r) => ({
      month: formatRecordDate(r.record_date),
      weight: r.weight,
    }));
  return mapped.length > 0 ? mapped : null;
};

const AnalyticChart = () => {
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
    <div className="chart-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3>
            {isChildSelected
              ? `Weight Trend — ${selectedChild.name}`
              : "Child Growth Trends"}
          </h3>
          <p className="chart-subtitle">
            {isChildSelected
              ? `Weight (kg) over all recorded visits`
              : "Height (cm) & Weight (kg) — sample data"}
          </p>
        </div>

        {isChildSelected ? (
          <span style={{
            background: "rgba(59,130,246,0.15)",
            border: "1px solid rgba(59,130,246,0.35)",
            borderRadius: "20px",
            padding: "3px 10px",
            fontSize: "0.68rem",
            color: "#93c5fd",
            whiteSpace: "nowrap",
          }}>
            📊 {selectedChild.name}
          </span>
        ) : (
          <span style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "3px 10px",
            fontSize: "0.68rem",
            color: "rgba(241,245,249,0.4)",
            whiteSpace: "nowrap",
          }}>
            No child selected
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="month"
            tick={{ fill: "rgba(241,245,249,0.45)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(241,245,249,0.45)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: "0.7rem", color: "rgba(241,245,249,0.55)" }}
          />

          {/* Weight line — always shown */}
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#ec4899"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#ec4899", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            name="Weight (kg)"
          />

        
          {!isChildSelected && (
            <Line
              type="monotone"
              dataKey="height"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              name="Height (cm)"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticChart;