import { Line } from 'react-chartjs-2'

export default function ErrorChart({ errors, threshold, timestamps }) {

  const every = Math.max(1, Math.floor(timestamps.length / 8))
  const labels = timestamps.map((t, i) =>
    i % every === 0 ? t.slice(11, 19) : ''
  )

  const data = {
    labels,
    datasets: [{
      label: 'Reconstruction Error',
      data: errors,
      borderColor: 'rgba(88, 166, 255, 0.8)',
      backgroundColor: 'rgba(88, 166, 255, 0.06)',
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 3,
      fill: true,
      tension: 0.3,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    plugins: {
      legend: { display: false },
      annotation: {
        annotations: {
          ucl: {
            type: 'line',
            yMin: threshold,
            yMax: threshold,
            borderColor: 'rgba(210, 153, 34, 0.9)',
            borderWidth: 1.5,
            borderDash: [6, 3],
            label: {
              display: true,
              content: `UCL ${threshold.toFixed(3)}`,
              position: 'end',
              color: 'rgba(210, 153, 34, 0.9)',
              font: { size: 10 },
              backgroundColor: 'transparent',
              yAdjust: -10,
            },
          },
        },
      },
    },
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
        <h3>Reconstruction Error</h3>
        <div className="legend">
          <span className="legend-dot blue"></span><span>Error</span>
          <span className="legend-dot yellow"></span><span>UCL threshold</span>
        </div>
      </div>
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}