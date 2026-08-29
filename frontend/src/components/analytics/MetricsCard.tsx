import React from 'react';
import { HealthMetrics } from '../../types';
import { useFormat } from '../../hooks/useFormat';

interface MetricsCardProps {
  metrics: HealthMetrics;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ metrics }) => {
  const { formatDate } = useFormat();

  const getMetricColor = (percentage?: number) => {
    if (!percentage) return '#gray';
    if (percentage >= 80) return '#d4edda'; // green
    if (percentage >= 50) return '#fff3cd'; // yellow
    return '#f8d7da'; // red
  };

  return (
    <div className="metrics-card">
      <h2>Current Health Status</h2>
      <p className="card-date">As of {formatDate(metrics.metric_date)}</p>

      <div className="metrics-grid">
        {/* Growth Metrics */}
        <div className="metric-section">
          <h3>📏 Growth</h3>
          {metrics.latest_weight && (
            <p>
              <strong>Weight:</strong> {metrics.latest_weight} kg
              {metrics.average_weight_gain_per_month && (
                <span className="metric-detail">
                  {' '}(+{metrics.average_weight_gain_per_month.toFixed(2)} kg/month)
                </span>
              )}
            </p>
          )}
          {metrics.latest_height && (
            <p>
              <strong>Height:</strong> {metrics.latest_height} cm
              {metrics.average_height_gain_per_month && (
                <span className="metric-detail">
                  {' '}(+{metrics.average_height_gain_per_month.toFixed(2)} cm/month)
                </span>
              )}
            </p>
          )}
          {!metrics.latest_weight && !metrics.latest_height && (
            <p className="placeholder">No measurements recorded yet</p>
          )}
        </div>

        {/* Vaccination Metrics */}
        <div className="metric-section">
          <h3>💉 Vaccinations</h3>
          <div
            className="metric-progress"
            style={{ backgroundColor: getMetricColor(metrics.vaccination_percentage) }}
          >
            <p>
              <strong>{metrics.vaccination_percentage.toFixed(0)}%</strong> Complete
            </p>
            <p className="metric-detail">
              {metrics.vaccinations_completed} of{' '}
              {metrics.vaccinations_completed + metrics.vaccinations_pending} administered
            </p>
          </div>
          {metrics.vaccinations_pending > 0 && (
            <p className="warning">
              ⚠️ {metrics.vaccinations_pending} pending vaccinations
            </p>
          )}
        </div>

        {/* Checkup Metrics */}
        <div className="metric-section">
          <h3>🏥 Checkups</h3>
          {metrics.last_checkup_date ? (
            <>
              <p>
                <strong>Last Checkup:</strong> {formatDate(metrics.last_checkup_date)}
              </p>
              <p className="metric-detail">
                {metrics.days_since_last_checkup} days ago
              </p>
              {metrics.days_since_last_checkup && metrics.days_since_last_checkup > 90 && (
                <p className="warning">⚠️ Schedule a checkup soon</p>
              )}
            </>
          ) : (
            <p className="placeholder">No checkups recorded yet</p>
          )}
        </div>

        {/* Feeding Metrics */}
        <div className="metric-section">
          <h3>🍼 Feeding</h3>
          {metrics.average_feeds_per_day ? (
            <>
              <p>
                <strong>Feeds/Day:</strong> {metrics.average_feeds_per_day.toFixed(1)}
              </p>
              {metrics.average_feeding_duration_minutes && (
                <p className="metric-detail">
                  Avg Duration: {metrics.average_feeding_duration_minutes.toFixed(0)} min
                </p>
              )}
            </>
          ) : (
            <p className="placeholder">No feeding records yet</p>
          )}
        </div>

        {/* Sleep Metrics */}
        <div className="metric-section">
          <h3>😴 Sleep</h3>
          {metrics.total_sleep_hours ? (
            <>
              <p>
                <strong>Total Sleep:</strong> {metrics.total_sleep_hours.toFixed(1)} hours/day
              </p>
              {metrics.average_night_sleep_hours && (
                <p className="metric-detail">
                  Night: {metrics.average_night_sleep_hours.toFixed(1)}h
                </p>
              )}
              {metrics.average_nap_hours && (
                <p className="metric-detail">
                  Naps: {metrics.average_nap_hours.toFixed(1)}h
                </p>
              )}
            </>
          ) : (
            <p className="placeholder">No sleep records yet</p>
          )}
        </div>

        {/* Medicine & Milestone Metrics */}
        <div className="metric-section">
          <h3>📊 Other</h3>
          <p>
            <strong>Active Medicines:</strong> {metrics.active_medicines_count}
          </p>
          <p>
            <strong>Milestones:</strong> {metrics.milestones_achieved} achieved
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;
