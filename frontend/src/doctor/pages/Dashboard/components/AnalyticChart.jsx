import "./AnalyticChart.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", height: 85, weight: 12 },
  { month: "Feb", height: 87, weight: 12.5 },
  { month: "Mar", height: 89, weight: 13 },
  { month: "Apr", height: 91, weight: 13.6 },
  { month: "May", height: 93, weight: 14 },
  { month: "Jun", height: 95, weight: 14.5 },
];

const AnalyticChart = () => {
  return (
    <div className="chart-container">
      <h3>Child Growth Trends</h3>
      <p className="chart-subtitle">
        Height (cm) & Weight (kg) over last 6 months
      </p>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="height"
            stroke="#14b8a6"
            strokeWidth={3}
            dot={{ r: 4 }}
            name="Height (cm)"
          />

          <Line
            type="monotone"
            dataKey="weight"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 4 }}
            name="Weight (kg)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticChart;
