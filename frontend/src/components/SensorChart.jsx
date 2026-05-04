import { Line } from 'react-chartjs-2'

const shortName = name =>
  name.replace('RMS', '').replace('Volume Flow Rate', 'Flow')

export default function SensorChart({
  sensors,
  sensorNames,
  timestamps,
  predictions,
  activeSensor,
  onSensorChange,
}) {

  const sensorName = sensorNames[activeSensor]
  const values = sensors[sensorName]

  const every = Math.max(1, Math.floor(timestamps.length / 8))
  const labels = timestamps.map((t, i) =>
    i % every === 0 ? t.slice(11, 19) : ''
  )

  const anomalyOverlay = predictions.map((p, i) =>
    p === 1 ? values[i] : null
  )

  const data = {
    labels,
    datasets: [
      {
        label: sensorName,
        data: values,
        borderColor: 'rgba(88, 166, 255, 0.8)',
        backgroundColor: 'rgba(88, 166, 255, 0.05)',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: true,
        tension: 0.3,
        order: 2,
      },
      {
        label: 'Anomaly',
        data: anomalyOverlay,
        borderColor: 'rgba(248, 81, 73, 0.9)',
        backgroundColor: 'rgba(248, 81, 73, 0.18)',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: true,
        tension: 0.3,
        spanGaps: false,
        order: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: { color: '#8b949e', font: { size: 10 }, maxRotation: 0 },
        grid: { color: 'rgba(48, 54, 61, 0.6)' },
      },
      y: {
        ticks: { color: '#8b949e', font: { size: 10 } },
        grid: { color: 'rgba(48, 54, 61, 0.6)' },
      },
    },
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Sensor Data</h3>
        <div className="sensor-tabs">
          {sensorNames.map((name, index) => (
            <button
              key={name}
              className={`sensor-tab ${index === activeSensor ? 'active' : ''}`}
              onClick={() => onSensorChange(index)}
            >
              {shortName(name)}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}