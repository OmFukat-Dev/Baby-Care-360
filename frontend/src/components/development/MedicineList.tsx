import React from 'react';
import { MedicineRecord } from '../../types';
import { useFormat } from '../../hooks/useFormat';

interface MedicineListProps {
  records: MedicineRecord[];
  onEdit?: (record: MedicineRecord) => void;
  onDelete?: (id: number) => void;
}

const MedicineList: React.FC<MedicineListProps> = ({ records, onEdit, onDelete }) => {
  const { formatDate } = useFormat();

  if (records.length === 0) {
    return <p className="empty-state">No medicine records yet.</p>;
  }

  const isActive = (startDate: string, endDate?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    const todayDate = new Date(today);

    return (
      start <= todayDate && (!end || end >= todayDate)
    );
  };

  return (
    <div className="medicine-list">
      {records.map((record) => (
        <article
          key={record.id}
          className="record-item"
          style={{
            borderLeft: `4px solid ${isActive(record.start_date, record.end_date) ? '#28a745' : '#ccc'}`,
          }}
        >
          <div>
            <h3>{record.medicine_name}</h3>
            <p className="medicine-status">
              {isActive(record.start_date, record.end_date) ? '✓ Active' : 'Completed'}
            </p>
            <p>
              <strong>Dose:</strong> {record.dose}
            </p>
            <p>
              <strong>Frequency:</strong> {record.frequency}
            </p>
            <p>
              <strong>Period:</strong> {formatDate(record.start_date)}
              {record.end_date && ` to ${formatDate(record.end_date)}`}
            </p>
            {record.reason && <p>Reason: {record.reason}</p>}
            {record.doctor_name && <p>Doctor: {record.doctor_name}</p>}
            {record.route && <p>Route: {record.route}</p>}
            {record.reminder_enabled && <p className="reminder-badge">🔔 Reminders enabled</p>}
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
                    if (window.confirm('Delete this medicine record?')) {
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

export default MedicineList;
