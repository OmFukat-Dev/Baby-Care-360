import React from 'react';
import { FeedingRecord } from '../../types';
import { useFormat } from '../../hooks/useFormat';

interface FeedingLogProps {
  records: FeedingRecord[];
  onEdit?: (record: FeedingRecord) => void;
  onDelete?: (id: number) => void;
}

const FeedingLog: React.FC<FeedingLogProps> = ({ records, onEdit, onDelete }) => {
  const { formatDate } = useFormat();

  if (records.length === 0) {
    return <p className="empty-state">No feeding records yet.</p>;
  }

  const feedTypeColor: Record<string, string> = {
    breastfeed: '#d4edda',
    formula: '#d1ecf1',
    solids: '#fff3cd',
    mixed: '#e2e3e5',
  };

  const feedTypeLabel: Record<string, string> = {
    breastfeed: 'Breastfed',
    formula: 'Formula',
    solids: 'Solids',
    mixed: 'Mixed',
  };

  return (
    <div className="feeding-log">
      {records.map((record) => (
        <article
          key={record.id}
          className="record-item"
          style={{ borderLeft: `4px solid ${feedTypeColor[record.feed_type]}` }}
        >
          <div>
            <h3>{feedTypeLabel[record.feed_type]}</h3>
            <p className="record-date">{formatDate(record.date)}</p>
            {record.time && <p>Time: {record.time}</p>}
            {record.amount && <p>Amount: {record.amount}</p>}
            {record.duration_minutes && <p>Duration: {record.duration_minutes} minutes</p>}
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
                    if (window.confirm('Delete this feeding record?')) {
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

export default FeedingLog;
