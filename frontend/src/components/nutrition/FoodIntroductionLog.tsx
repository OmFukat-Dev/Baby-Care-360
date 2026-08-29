import React from 'react';
import { FoodIntroduction } from '../../types';
import { useFormat } from '../../hooks/useFormat';

interface FoodIntroductionLogProps {
  records: FoodIntroduction[];
  onEdit?: (record: FoodIntroduction) => void;
  onDelete?: (id: number) => void;
}

const FoodIntroductionLog: React.FC<FoodIntroductionLogProps> = ({
  records,
  onEdit,
  onDelete,
}) => {
  const { formatDate } = useFormat();

  if (records.length === 0) {
    return <p className="empty-state">No foods introduced yet.</p>;
  }

  const reactionColor: Record<string, string> = {
    'well tolerated': '#d4edda',
    'rash': '#f8d7da',
    'vomiting': '#f8d7da',
    'diarrhea': '#f8d7da',
    'constipation': '#fff3cd',
  };

  return (
    <div className="food-log">
      {records.map((record) => (
        <article
          key={record.id}
          className="record-item"
          style={
            record.reaction ? { borderLeft: `4px solid ${reactionColor[record.reaction] || '#dbe6e9'}` } : {}
          }
        >
          <div>
            <h3>{record.food_name}</h3>
            <p className="record-date">{formatDate(record.date)}</p>
            {record.food_group && <p>Group: {record.food_group}</p>}
            {record.preparation && <p>Preparation: {record.preparation}</p>}
            {record.texture && <p>Texture: {record.texture}</p>}
            {record.amount && <p>Amount: {record.amount}</p>}
            {record.reaction && (
              <p>
                <strong>Reaction:</strong> {record.reaction}
              </p>
            )}
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
                    if (window.confirm('Delete this food introduction record?')) {
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

export default FoodIntroductionLog;
