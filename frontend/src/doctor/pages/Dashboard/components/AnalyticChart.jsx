import "./AnalyticChart.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
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
      <div style={{ background:"rgba(15,16,28,0.95)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"0.6rem 0.9rem", fontSize:"0.72rem", color:"#f1f5f9" }}>
        <p style={{ marginBottom:"0.3rem", fontWeight:600 }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
      </div>
    );
  }
  return null;
};

const AnalyticChart = () => {
  return (
    <div className="chart-container">
      <h3>Child Growth Trends</h3>
      <p className="chart-subtitle">Height (cm) & Weight (kg) — last 6 months</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" tick={{ fill:"rgba(241,245,249,0.45)", fontSize:11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill:"rgba(241,245,249,0.45)", fontSize:11 }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize:"0.7rem", color:"rgba(241,245,249,0.55)" }} />
          <Line type="monotone" dataKey="height" stroke="#3b82f6" strokeWidth={2.5} dot={{ r:3, fill:"#3b82f6", strokeWidth:0 }} activeDot={{ r:5 }} name="Height (cm)" />
          <Line type="monotone" dataKey="weight" stroke="#ec4899" strokeWidth={2.5} dot={{ r:3, fill:"#ec4899", strokeWidth:0 }} activeDot={{ r:5 }} name="Weight (kg)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticChart;
