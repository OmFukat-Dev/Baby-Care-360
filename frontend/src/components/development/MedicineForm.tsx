import React, { useState, useEffect } from 'react';
import { MedicineRecord } from '../../types';

interface MedicineFormProps {
  record?: MedicineRecord;
  onSubmit: (data: Partial<MedicineRecord>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const MedicineForm: React.FC<MedicineFormProps> = ({
  record,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form, setForm] = useState<{
    medicine_name: string;
    dose: string;
    frequency: string;
    start_date: string;
    end_date: string;
    doctor_name: string;
    reason: string;
    route: 'oral' | 'topical' | 'injection' | 'inhalation' | 'rectal';
    notes: string;
    reminder_enabled: boolean;
  }>({
    medicine_name: '',
    dose: '',
    frequency: '',
    start_date: '',
    end_date: '',
    doctor_name: '',
    reason: '',
    route: 'oral',
    notes: '',
    reminder_enabled: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setForm({
        medicine_name: record.medicine_name,
        dose: record.dose,
        frequency: record.frequency,
        start_date: record.start_date,
        end_date: record.end_date || '',
        doctor_name: record.doctor_name || '',
        reason: record.reason || '',
        route: (record.route || 'oral') as 'oral' | 'topical' | 'injection' | 'inhalation' | 'rectal',
        notes: record.notes || '',
        reminder_enabled: record.reminder_enabled,
      });
    }
  }, [record]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        medicine_name: form.medicine_name,
        dose: form.dose,
        frequency: form.frequency,
        start_date: form.start_date,
        end_date: form.end_date || undefined,
        doctor_name: form.doctor_name || undefined,
        reason: form.reason || undefined,
        route: form.route || undefined,
        notes: form.notes || undefined,
        reminder_enabled: form.reminder_enabled,
      };
      await onSubmit(payload);
      if (!record) {
        setForm({
          medicine_name: '',
          dose: '',
          frequency: '',
          start_date: '',
          end_date: '',
          doctor_name: '',
          reason: '',
          route: 'oral',
          notes: '',
          reminder_enabled: false,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save medicine record.');
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label>
        Medicine Name
        <input
          type="text"
          value={form.medicine_name}
          onChange={(e) => setForm({ ...form, medicine_name: e.target.value })}
          placeholder="e.g., Paracetamol, Ibuprofen"
          required
        />
      </label>

      <label>
        Dose
        <input
          type="text"
          value={form.dose}
          onChange={(e) => setForm({ ...form, dose: e.target.value })}
          placeholder="e.g., 125mg/5ml, 1 tablet"
          required
        />
      </label>

      <label>
        Frequency
        <input
          type="text"
          value={form.frequency}
          onChange={(e) => setForm({ ...form, frequency: e.target.value })}
          placeholder="e.g., Every 4-6 hours, Twice daily"
          required
        />
      </label>

      <div className="form-row">
        <label>
          Start Date
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            required
          />
        </label>
        <label>
          End Date (if applicable)
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </label>
      </div>

      <label>
        Doctor Name
        <input
          type="text"
          value={form.doctor_name}
          onChange={(e) => setForm({ ...form, doctor_name: e.target.value })}
          placeholder="Optional: doctor who prescribed"
        />
      </label>

      <label>
        Reason for Medication
        <input
          type="text"
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          placeholder="e.g., Fever, Cough, Infection"
        />
      </label>

      <label>
        Route of Administration
        <select
          value={form.route}
          onChange={(e) => setForm({ ...form, route: e.target.value as 'oral' | 'topical' | 'injection' | 'inhalation' | 'rectal' })}
        >
          <option value="">Select route</option>
          <option value="oral">Oral (by mouth)</option>
          <option value="topical">Topical (on skin)</option>
          <option value="injection">Injection</option>
          <option value="inhalation">Inhalation</option>
          <option value="rectal">Rectal</option>
        </select>
      </label>

      <label>
        Notes
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Any special instructions or side effects observed"
        />
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={form.reminder_enabled}
          onChange={(e) => setForm({ ...form, reminder_enabled: e.target.checked })}
        />
        Enable reminders for this medicine
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving…' : record ? 'Update Medicine' : 'Record Medicine'}
      </button>

      {record && onCancel && (
        <button type="button" className="link-button cancel-button" onClick={onCancel}>
          Cancel editing
        </button>
      )}
    </form>
  );
};

export default MedicineForm;
