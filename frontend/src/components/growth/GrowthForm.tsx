import React, { useState, useEffect } from 'react';
import { GrowthMeasurement } from '../../types';

interface GrowthFormProps {
  measurement?: GrowthMeasurement;
  onSubmit: (data: Partial<GrowthMeasurement>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const GrowthForm: React.FC<GrowthFormProps> = ({
  measurement,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form, setForm] = useState({
    measurement_date: '',
    weight: '',
    height: '',
    length: '',
    head_circumference: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (measurement) {
      setForm({
        measurement_date: measurement.measurement_date,
        weight: measurement.weight?.toString() || '',
        height: measurement.height?.toString() || '',
        length: measurement.length?.toString() || '',
        head_circumference: measurement.head_circumference?.toString() || '',
        notes: measurement.notes || '',
      });
    }
  }, [measurement]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        measurement_date: form.measurement_date,
        weight: form.weight ? Number(form.weight) : undefined,
        height: form.height ? Number(form.height) : undefined,
        length: form.length ? Number(form.length) : undefined,
        head_circumference: form.head_circumference ? Number(form.head_circumference) : undefined,
        notes: form.notes || undefined,
      };
      await onSubmit(payload);
      if (!measurement) {
        setForm({
          measurement_date: '',
          weight: '',
          height: '',
          length: '',
          head_circumference: '',
          notes: '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save measurement.');
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label>
        Measurement Date
        <input
          type="date"
          value={form.measurement_date}
          onChange={(e) => setForm({ ...form, measurement_date: e.target.value })}
          required
        />
      </label>

      <div className="form-row">
        <label>
          Weight (kg)
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
          />
        </label>
        <label>
          Height (cm)
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.height}
            onChange={(e) => setForm({ ...form, height: e.target.value })}
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Length (cm)
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.length}
            onChange={(e) => setForm({ ...form, length: e.target.value })}
          />
        </label>
        <label>
          Head Circumference (cm)
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.head_circumference}
            onChange={(e) => setForm({ ...form, head_circumference: e.target.value })}
          />
        </label>
      </div>

      <label>
        Notes
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          maxLength={500}
          placeholder="Optional notes about the measurement"
        />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving…' : measurement ? 'Update Measurement' : 'Record Measurement'}
      </button>

      {measurement && onCancel && (
        <button type="button" className="link-button cancel-button" onClick={onCancel}>
          Cancel editing
        </button>
      )}
    </form>
  );
};

export default GrowthForm;
