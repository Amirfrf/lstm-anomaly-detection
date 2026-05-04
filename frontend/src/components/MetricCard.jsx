export default function MetricCard({ label, value, color }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <span
        className="metric-value"
        style={color ? { color } : {}}
      >
        {value}
      </span>
    </div>
  )
}