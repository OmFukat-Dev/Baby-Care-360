import React, { useState, useEffect } from 'react';
import { Reminder } from '../../types';

interface ReminderFormProps {
  record?: Reminder;
  onSubmit: (data: Partial<Reminder>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const ReminderForm: React.FC<ReminderFormProps> = ({
  record,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form, setForm] = useState({
    reminder_type: '',
    message: '',
    reminder_date: '',
    reminder_time: '',
    status: 'pending',
    related_record_type: '',
    related_record_id: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setForm({
        reminder_type: record.reminder_type,
        message: record.message,
        reminder_date: record.reminder_date,
        reminder_time: record.reminder_time || '',
        status: record.status,
        related_record_type: record.related_record_type || '',
        related_record_id: record.related_record_id ? String(record.related_record_id) : '',
        notes: record.notes || '',
      });
    }
  }, [record]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        reminder_type: form.reminder_type as 'vaccination' | 'checkup' | 'medicine' | 'feeding' | 'appointment' | 'milestone' | 'custom',
        message: form.message,
        reminder_date: form.reminder_date,
        reminder_time: form.reminder_time || undefined,
        status: form.status as 'pending' | 'sent' | 'dismissed' | 'completed',
        related_record_type: form.related_record_type || undefined,
        related_record_id: form.related_record_id ? parseInt(form.related_record_id) : undefined,
        notes: form.notes || undefined,
      };
      await onSubmit(payload);
      if (!record) {
        setForm({
          reminder_type: 'vaccination',
          message: '',
          reminder_date: '',
          reminder_time: '',
          status: 'pending',
          related_record_type: '',
          related_record_id: '',
          notes: '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save reminder.');
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label>
        Reminder Type
        <select
          value={form.reminder_type}
          onChange={(e) => setForm({ ...form, reminder_type: e.target.value })}
          required
        >
          <option value="">Select reminder type</option>
          <option value="vaccination">Vaccination</option>
          <option value="checkup">Checkup</option>
          <option value="medicine">Medicine</option>
          <option value="feeding">Feeding</option>
          <option value="appointment">Appointment</option>
          <option value="milestone">Milestone</option>
          <option value="custom">Custom</option>
        </select>
      </label>

      <label>
        Reminder Message
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="What should the reminder say?"
          required
        />
      </label>

      <label>
        Reminder Date
        <input
          type="date"
          value={form.reminder_date}
          onChange={(e) => setForm({ ...form, reminder_date: e.target.value })}
          required
        />
      </label>

      <label>
        Reminder Time (Optional)
        <input
          type="time"
          value={form.reminder_time}
          onChange={(e) => setForm({ ...form, reminder_time: e.target.value })}
        />
      </label>

      <label>
        Status
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="dismissed">Dismissed</option>
          <option value="completed">Completed</option>
        </select>
      </label>

      <label>
        Related Record Type (Optional)
        <select
          value={form.related_record_type}
          onChange={(e) => setForm({ ...form, related_record_type: e.target.value })}
        >
          <option value="">No specific record</option>
          <option value="vaccination">Vaccination</option>
          <option value="checkup">Checkup</option>
          <option value="medicine">Medicine</option>
          <option value="growth">Growth</option>
          <option value="feeding">Feeding</option>
        </select>
      </label>

      <label>
        Related Record ID (Optional)
        <input
          type="number"
          value={form.related_record_id}
          onChange={(e) => setForm({ ...form, related_record_id: e.target.value })}
          placeholder="ID of the related health record"
        />
      </label>

      <label>
        Notes
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Any additional details about this reminder"
        />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving…' : record ? 'Update Reminder' : 'Create Reminder'}
      </button>

      {record && onCancel && (
        <button type="button" className="link-button cancel-button" onClick={onCancel}>
          Cancel editing
        </button>
      )}
    </form>
  );
};

export default ReminderForm;
