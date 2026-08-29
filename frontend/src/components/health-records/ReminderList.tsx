import React from 'react';
import { Reminder } from '../../types';
import { useFormat } from '../../hooks/useFormat';

interface ReminderListProps {
  reminders: Reminder[];
  onEdit?: (record: Reminder) => void;
  onDelete?: (id: number) => void;
}

const ReminderList: React.FC<ReminderListProps> = ({ reminders, onEdit, onDelete }) => {
  const { formatDate } = useFormat();

  if (reminders.length === 0) {
    return <p className="empty-state">No reminders set up yet.</p>;
  }

  const getReminderIcon = (type: string) => {
    const icons: Record<string, string> = {
      vaccination: '💉',
      checkup: '🏥',
      medicine: '💊',
      feeding: '🍼',
      appointment: '📅',
      milestone: '🎯',
      custom: '📌',
    };
    return icons[type] || '⏰';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#fff3cd',
      sent: '#d1ecf1',
      dismissed: '#e7d4f5',
      completed: '#d4edda',
    };
    return colors[status] || '#f8f9fa';
  };

  const isOverdue = (date: string) => {
    return new Date(date) < new Date();
  };

  return (
    <div className="reminder-list">
      {reminders.map((reminder) => (
        <article
          key={reminder.id}
          className="record-item"
          style={{
            backgroundColor: getStatusColor(reminder.status),
            opacity: isOverdue(reminder.reminder_date) && reminder.status === 'pending' ? 0.7 : 1,
          }}
        >
          <div>
            <h3>
              {getReminderIcon(reminder.reminder_type)} {reminder.message}
            </h3>
            <p className="reminder-status">
              <strong>Status:</strong>{' '}
              {reminder.status === 'pending' && isOverdue(reminder.reminder_date)
                ? '⚠️ Overdue'
                : reminder.status}
            </p>
            <p>
              <strong>Date:</strong> {formatDate(reminder.reminder_date)}
              {reminder.reminder_time && ` at ${reminder.reminder_time}`}
            </p>
            {reminder.related_record_type && (
              <p>
                <strong>Related to:</strong> {reminder.related_record_type}
                {reminder.related_record_id && ` (#${reminder.related_record_id})`}
              </p>
            )}
            {reminder.notes && <p>Notes: {reminder.notes}</p>}
          </div>
          {(onEdit || onDelete) && (
            <div className="record-actions">
              {onEdit && (
                <button className="edit-button" onClick={() => onEdit(reminder)}>
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  className="remove-button"
                  onClick={() => {
                    if (window.confirm('Delete this reminder?')) {
                      onDelete(reminder.id);
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

export default ReminderList;
