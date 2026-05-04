export default function Sidebar({ experiments, selectedId, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Experiments</h2>
        <span className="count">{experiments.length}</span>
      </div>
      <ul className="exp-list">
        {experiments.map(exp => (
          <ExperimentItem
            key={exp.id}
            experiment={exp}
            isActive={exp.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </aside>
  )
}

function ExperimentItem({ experiment, isActive, onSelect }) {
  const { id, f1 } = experiment
  const label = String(id).padStart(2, '0')
  const f1Class = f1 >= 0.8 ? 'f1-high' : f1 >= 0.6 ? 'f1-medium' : 'f1-low'

  return (
    <li
      className={`exp-item ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(id)}
    >
      <span className="exp-id">#{label}</span>
      <span className="exp-label">Experiment {label}</span>
      <span className={`f1-badge ${f1Class}`}>{f1.toFixed(2)}</span>
    </li>
  )
}