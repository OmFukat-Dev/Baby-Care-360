import React, { useState, useEffect } from 'react';
import { SleepRecord } from '../../types';

interface SleepFormProps {
  record?: SleepRecord;
  onSubmit: (data: Partial<SleepRecord>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const SleepForm: React.FC<SleepFormProps> = ({
  record,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form, setForm] = useState<{
    date: string;
    sleep_type: 'night_sleep' | 'nap';
    start_time: string;
    end_time: string;
    duration_minutes: string;
    quality: 'good' | 'fair' | 'poor';
    notes: string;
  }>({
    date: '',
    sleep_type: 'night_sleep',
    start_time: '',
    end_time: '',
    duration_minutes: '',
    quality: 'good',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setForm({
        date: record.date,
        sleep_type: record.sleep_type,
        start_time: record.start_time || '',
        end_time: record.end_time || '',
        duration_minutes: record.duration_minutes?.toString() || '',
        quality: (record.quality || 'good') as 'good' | 'fair' | 'poor',
        notes: record.notes || '',
      });
    }
  }, [record]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        date: form.date,
        sleep_type: form.sleep_type,
        start_time: form.start_time,
        end_time: form.end_time || undefined,
        duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : undefined,
        quality: form.quality || undefined,
        notes: form.notes || undefined,
      };
      await onSubmit(payload);
      if (!record) {
        setForm({
          date: '',
          sleep_type: 'night_sleep',
          start_time: '',
          end_time: '',
          duration_minutes: '',
          quality: 'good',
          notes: '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save sleep record.');
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label>
        Date
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
      </label>

      <label>
        Sleep Type
        <select
          value={form.sleep_type}
          onChange={(e) => setForm({ ...form, sleep_type: e.target.value as any })}
        >
          <option value="night_sleep">Night Sleep</option>
          <option value="nap">Nap</option>
        </select>
      </label>

      <div className="form-row">
        <label>
          Start Time
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            required
          />
        </label>
        <label>
          End Time
          <input
            type="time"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
          />
        </label>
      </div>

      <label>
        Duration (minutes)
        <input
          type="number"
          min="0"
          value={form.duration_minutes}
          onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
          placeholder="Optional: total minutes slept"
        />
      </label>

      <label>
        Quality
        <select
          value={form.quality}
          onChange={(e) => setForm({ ...form, quality: e.target.value as 'good' | 'fair' | 'poor' })}
        >
          <option value="">Select quality</option>
          <option value="good">Good - Slept peacefully</option>
          <option value="fair">Fair - Some disturbances</option>
          <option value="poor">Poor - Frequent waking</option>
        </select>
      </label>

      <label>
        Notes
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="e.g., Woke up 2 times, had nightmare, restless sleep"
        />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving…' : record ? 'Update Sleep Record' : 'Log Sleep'}
      </button>

      {record && onCancel && (
        <button type="button" className="link-button cancel-button" onClick={onCancel}>
          Cancel editing
        </button>
      )}
    </form>
  );
};

export default SleepForm;
