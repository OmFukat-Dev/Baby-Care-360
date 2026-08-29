import React from 'react';
import { SleepRecord } from '../../types';
import { useFormat } from '../../hooks/useFormat';

interface SleepLogProps {
  records: SleepRecord[];
  onEdit?: (record: SleepRecord) => void;
  onDelete?: (id: number) => void;
}

const SleepLog: React.FC<SleepLogProps> = ({ records, onEdit, onDelete }) => {
  const { formatDate } = useFormat();

  if (records.length === 0) {
    return <p className="empty-state">No sleep records yet.</p>;
  }

  const qualityColor: Record<string, string> = {
    good: '#d4edda',
    fair: '#fff3cd',
    poor: '#f8d7da',
  };

  const sleepTypeLabel: Record<string, string> = {
    night_sleep: 'Night Sleep',
    nap: 'Nap',
  };

  return (
    <div className="sleep-log">
      {records.map((record) => (
        <article
          key={record.id}
          className="record-item"
          style={
            record.quality ? { borderLeft: `4px solid ${qualityColor[record.quality]}` } : {}
          }
        >
          <div>
            <h3>{sleepTypeLabel[record.sleep_type]}</h3>
            <p className="record-date">{formatDate(record.date)}</p>
            {record.start_time && (
              <p>
                Time: {record.start_time} {record.end_time && `- ${record.end_time}`}
              </p>
            )}
            {record.duration_minutes && <p>Duration: {record.duration_minutes} minutes</p>}
            {record.quality && <p>Quality: {record.quality}</p>}
            {record.notes && <p>Notes: {record.notes}</p>}
          </div>
          {(onEdit || onDelete) && (
            <div className="record-actions">
              {onEdit && (
                <button className="edit-button" onClick={() => onEdit(record)}>
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  className="remove-button"
                  onClick={() => {
                    if (window.confirm('Delete this sleep record?')) {
                      onDelete(record.id);
                    }
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
};

export default SleepLog;
