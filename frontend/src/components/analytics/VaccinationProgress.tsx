import React from 'react';
import { HealthStatistics } from '../../types';

interface VaccinationProgressProps {
  stats: HealthStatistics;
}

const VaccinationProgress: React.FC<VaccinationProgressProps> = ({ stats }) => {
  const { total, completed, pending, missed, percentage } = stats.vaccinations;

  const getProgressColor = (pct: number) => {
    if (pct >= 90) return '#d4edda'; // green
    if (pct >= 70) return '#fff3cd'; // yellow
    if (pct >= 50) return '#ffe0e0'; // light red
    return '#f8d7da'; // red
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      completed: '✅',
      pending: '⏳',
      missed: '❌',
    };
    return icons[status] || '❓';
  };

  return (
    <div className="vaccination-progress">
      <h2>💉 Vaccination Status</h2>

      <div className="progress-card" style={{ backgroundColor: getProgressColor(percentage) }}>
        <div className="progress-header">
          <h3>Overall Progress</h3>
          <p className="progress-percentage">{percentage.toFixed(0)}%</p>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${percentage}%`,
              backgroundColor: percentage >= 80 ? '#28a745' : percentage >= 50 ? '#ffc107' : '#dc3545',
            }}
          />
        </div>

        <div className="progress-details">
          <div className="detail-item">
            <span className="detail-icon">✅</span>
            <span className="detail-text">
              <strong>{completed}</strong> Completed
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">⏳</span>
            <span className="detail-text">
              <strong>{pending}</strong> Pending
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">❌</span>
            <span className="detail-text">
              <strong>{missed}</strong> Missed
            </span>
          </div>
        </div>

        <p className="progress-total">
          {completed} of {total} vaccinations administered
        </p>

        {pending > 0 && (
          <div className="progress-recommendation">
            <strong>⚠️ Action Needed:</strong> {pending} vaccination(s) pending. Schedule them as soon as possible.
          </div>
        )}

        {percentage === 100 && (
          <div className="progress-success">
            <strong>🎉 Excellent!</strong> All vaccinations are up to date.
          </div>
        )}
      </div>
    </div>
  );
};

export default VaccinationProgress;
