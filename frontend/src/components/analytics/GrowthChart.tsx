import React from 'react';
import { HealthStatistics } from '../../types';

interface GrowthChartProps {
  stats: HealthStatistics;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ stats }) => {
  if (!stats.growth.weight_data.length && !stats.growth.height_data.length) {
    return <p className="empty-state">No growth measurements to display.</p>;
  }

  const maxWeight = Math.max(...stats.growth.weight_data.map((d) => d.value || 0), 0);
  const maxHeight = Math.max(...stats.growth.height_data.map((d) => d.value || 0), 0);

  const renderChart = (
    data: Array<{ date: string; value: number }>,
    maxValue: number,
    unit: string,
    color: string
  ) => {
    if (!data.length) return null;

    return (
      <div className="chart">
        <h3>{unit} Progress</h3>
        <div className="chart-area">
          {data.map((point, index) => (
            <div key={index} className="chart-point" title={`${point.date}: ${point.value} ${unit}`}>
              <div
                className="chart-bar"
                style={{
                  height: `${(point.value / maxValue) * 100}%`,
                  backgroundColor: color,
                }}
              />
              <p className="chart-label">{point.date.slice(-5)}</p>
            </div>
          ))}
        </div>
        <div className="chart-axis">
          <span>0</span>
          <span>{maxValue} {unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="growth-chart">
      <h2>📈 Growth Trajectory ({stats.period_days} days)</h2>
      <div className="chart-container">
        {renderChart(stats.growth.weight_data, maxWeight, 'kg', '#4CAF50')}
        {renderChart(stats.growth.height_data, maxHeight, 'cm', '#2196F3')}
      </div>
    </div>
  );
};

export default GrowthChart;
