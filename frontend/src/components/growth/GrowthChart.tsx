import React from 'react';
import { GrowthMeasurement } from '../../types';
import { useFormat } from '../../hooks/useFormat';

interface GrowthChartProps {
  measurements: GrowthMeasurement[];
}

const GrowthChart: React.FC<GrowthChartProps> = ({ measurements }) => {
  const { formatDate } = useFormat();

  if (measurements.length === 0) {
    return <p className="empty-state">No growth measurements recorded yet.</p>;
  }

  // Sort by measurement date
  const sorted = [...measurements].sort(
    (a, b) => new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()
  );

  // Get latest measurement
  const latest = sorted[sorted.length - 1];

  return (
    <div className="growth-chart">
      <div className="measurements-grid">
        {latest.weight && (
          <div className="measurement-card">
            <h4>Current Weight</h4>
            <p className="measurement-value">{latest.weight} kg</p>
            <p className="measurement-date">{formatDate(latest.measurement_date)}</p>
          </div>
        )}
        {latest.height && (
          <div className="measurement-card">
            <h4>Current Height</h4>
            <p className="measurement-value">{latest.height} cm</p>
            <p className="measurement-date">{formatDate(latest.measurement_date)}</p>
          </div>
        )}
        {latest.length && (
          <div className="measurement-card">
            <h4>Current Length</h4>
            <p className="measurement-value">{latest.length} cm</p>
            <p className="measurement-date">{formatDate(latest.measurement_date)}</p>
          </div>
        )}
        {latest.head_circumference && (
          <div className="measurement-card">
            <h4>Head Circumference</h4>
            <p className="measurement-value">{latest.head_circumference} cm</p>
            <p className="measurement-date">{formatDate(latest.measurement_date)}</p>
          </div>
        )}
      </div>

      <div className="measurements-history">
        <h4>Measurement History</h4>
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight (kg)</th>
              <th>Height (cm)</th>
              <th>Length (cm)</th>
              <th>Head Circ. (cm)</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr key={m.id}>
                <td>{formatDate(m.measurement_date)}</td>
                <td>{m.weight || '—'}</td>
                <td>{m.height || '—'}</td>
                <td>{m.length || '—'}</td>
                <td>{m.head_circumference || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GrowthChart;
