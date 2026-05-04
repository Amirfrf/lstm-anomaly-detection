import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'

// Register only the Chart.js pieces used by this dashboard.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  annotationPlugin
)

import App from './App.jsx'
import './App.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
