import React, { useState, useEffect } from 'react';
import { FeedingRecord } from '../../types';

interface FeedingFormProps {
  record?: FeedingRecord;
  onSubmit: (data: Partial<FeedingRecord>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const FeedingForm: React.FC<FeedingFormProps> = ({
  record,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form, setForm] = useState<{
    date: string;
    time: string;
    feed_type: 'breastfeed' | 'formula' | 'solids' | 'mixed';
    amount: string;
    duration_minutes: string;
    notes: string;
  }>({
    date: '',
    time: '',
    feed_type: 'breastfeed',
    amount: '',
    duration_minutes: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setForm({
        date: record.date,
        time: record.time || '',
        feed_type: record.feed_type,
        amount: record.amount || '',
        duration_minutes: record.duration_minutes?.toString() || '',
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
        time: form.time || undefined,
        feed_type: form.feed_type,
        amount: form.amount || undefined,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
        notes: form.notes || undefined,
      };
      await onSubmit(payload);
      if (!record) {
        setForm({
          date: '',
          time: '',
          feed_type: 'breastfeed',
          amount: '',
          duration_minutes: '',
          notes: '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save feeding record.');
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
        Time
        <input
          type="time"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
        />
      </label>

      <label>
        Feeding Type
        <select
          value={form.feed_type}
          onChange={(e) => setForm({ ...form, feed_type: e.target.value as any })}
        >
          <option value="breastfeed">Breastfed</option>
          <option value="formula">Formula</option>
          <option value="solids">Solids</option>
          <option value="mixed">Mixed</option>
        </select>
      </label>

      <div className="form-row">
        <label>
          Amount
          <input
            type="text"
            placeholder="e.g., 200ml, 10 minutes"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </label>
        {form.feed_type === 'breastfeed' && (
          <label>
            Duration (minutes)
            <input
              type="number"
              min="0"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
            />
          </label>
        )}
      </div>

      <label>
        Notes
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Optional notes about this feeding"
        />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving…' : record ? 'Update Record' : 'Log Feeding'}
      </button>

      {record && onCancel && (
        <button type="button" className="link-button cancel-button" onClick={onCancel}>
          Cancel editing
        </button>
      )}
    </form>
  );
};

export default FeedingForm;
