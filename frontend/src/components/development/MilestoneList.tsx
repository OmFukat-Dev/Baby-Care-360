import React from 'react';
import { Milestone } from '../../types';
import { useFormat } from '../../hooks/useFormat';

interface MilestoneListProps {
  milestones: Milestone[];
  onEdit?: (milestone: Milestone) => void;
  onDelete?: (id: number) => void;
}

const MilestoneList: React.FC<MilestoneListProps> = ({ milestones, onEdit, onDelete }) => {
  const { formatDate } = useFormat();

  if (milestones.length === 0) {
    return <p className="empty-state">No milestones recorded yet.</p>;
  }

  const milestoneTypeLabels: Record<string, string> = {
    gross_motor: 'Gross Motor',
    fine_motor: 'Fine Motor',
    language: 'Language',
    cognitive: 'Cognitive',
    social_emotional: 'Social & Emotional',
  };

  const milestoneTypeColors: Record<string, string> = {
    gross_motor: '#e3f2fd',
    fine_motor: '#f3e5f5',
    language: '#e8f5e9',
    cognitive: '#fff3e0',
    social_emotional: '#fce4ec',
  };

  // Sort by observed date, most recent first
  const sorted = [...milestones].sort(
    (a, b) =>
      new Date(b.observed_date).getTime() - new Date(a.observed_date).getTime()
  );

  return (
    <div className="milestone-list">
      {sorted.map((milestone) => (
        <article
          key={milestone.id}
          className="record-item"
          style={{ backgroundColor: milestoneTypeColors[milestone.milestone_type] }}
        >
          <div>
            <h3>{milestoneTypeLabels[milestone.milestone_type]}</h3>
            <p className="milestone-description">{milestone.description}</p>
            <p className="record-date">{formatDate(milestone.observed_date)}</p>
            {milestone.age_in_months && <p>Age: {milestone.age_in_months} months</p>}
            {milestone.notes && <p>Notes: {milestone.notes}</p>}
          </div>
          {(onEdit || onDelete) && (
            <div className="record-actions">
              {onEdit && (
                <button className="edit-button" onClick={() => onEdit(milestone)}>
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  className="remove-button"
                  onClick={() => {
                    if (window.confirm('Delete this milestone record?')) {
                      onDelete(milestone.id);
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

export default MilestoneList;
