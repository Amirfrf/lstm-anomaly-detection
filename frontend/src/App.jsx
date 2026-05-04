import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import MetricCard from './components/MetricCard'
import ErrorChart from './components/ErrorChart'
import SensorChart from './components/SensorChart'

export default function App() {
  const [experiments, setExperiments] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [experimentData, setExperimentData] = useState(null)
  const [activeSensor, setActiveSensor] = useState(0)

  // Load the experiment list once on startup, then pick the best one by F1.
  useEffect(() => {
    fetch('/api/experiments')
      .then(res => res.json())
      .then(data => {
        setExperiments(data)
        const best = data.reduce(
          (champion, challenger) => challenger.f1 > champion.f1 ? challenger : champion,
          data[0]
        )
        setSelectedId(best.id)
      })
  }, [])

  // Fetch the selected experiment whenever the sidebar selection changes.
  useEffect(() => {
    if (selectedId === null) return

    setExperimentData(null)
    setActiveSensor(0)

    fetch(`/api/experiment/${selectedId}`)
      .then(res => res.json())
      .then(data => setExperimentData(data))
  }, [selectedId])

  // Derived values stay in sync with the fetched experiment data.
  const f1 = experimentData?.metrics.f1 ?? null

  const f1Color = f1 === null ? undefined
    : f1 >= 0.8 ? 'var(--green)'
    : f1 >= 0.6 ? 'var(--yellow)'
    : 'var(--red)'

  const anomalyRate = experimentData
    ? experimentData.predictions.reduce((sum, v) => sum + v, 0) / experimentData.predictions.length
    : null

  return (
    <div className="layout">
      <Sidebar
        experiments={experiments}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <main className="main">

        <header className="dashboard-header">
          <div>
            <h1>LSTM Anomaly Detection</h1>
            <p className="subtitle">Industrial sensor monitoring — SKAB dataset</p>
          </div>
          <div className="header-tag">8 sensors · 34 experiments</div>
        </header>

        <section className="metrics-grid">
          <MetricCard
            label="F1 Score"
            value={f1 !== null ? f1.toFixed(2) : '—'}
            color={f1Color}
          />
          <MetricCard
            label="Precision"
            value={experimentData ? experimentData.metrics.precision.toFixed(2) : '—'}
          />
          <MetricCard
            label="Recall"
            value={experimentData ? experimentData.metrics.recall.toFixed(2) : '—'}
          />
          <MetricCard
            label="UCL Threshold"
            value={experimentData ? experimentData.threshold.toFixed(4) : '—'}
          />
          <MetricCard
            label="Anomaly Rate"
            value={anomalyRate !== null ? (anomalyRate * 100).toFixed(1) + '%' : '—'}
          />
        </section>

        <section className="charts-grid">
          {experimentData ? (
            <>
              <ErrorChart
                errors={experimentData.errors}
                threshold={experimentData.threshold}
                timestamps={experimentData.timestamps}
              />
              <SensorChart
                sensors={experimentData.sensors}
                sensorNames={experimentData.sensor_names}
                timestamps={experimentData.timestamps}
                predictions={experimentData.predictions}
                activeSensor={activeSensor}
                onSensorChange={setActiveSensor}
              />
            </>
          ) : (
            <div className="loading">Loading...</div>
          )}
        </section>

      </main>
    </div>
  )
}