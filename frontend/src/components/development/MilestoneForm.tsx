import React, { useState, useEffect } from 'react';
import { Milestone } from '../../types';

interface MilestoneFormProps {
  milestone?: Milestone;
  onSubmit: (data: Partial<Milestone>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({
  milestone,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form, setForm] = useState<{
    milestone_type: 'gross_motor' | 'fine_motor' | 'language' | 'cognitive' | 'social_emotional';
    description: string;
    observed_date: string;
    age_in_months: string;
    notes: string;
  }>({
    milestone_type: 'gross_motor',
    description: '',
    observed_date: '',
    age_in_months: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (milestone) {
      setForm({
        milestone_type: milestone.milestone_type,
        description: milestone.description,
        observed_date: milestone.observed_date,
        age_in_months: milestone.age_in_months?.toString() || '',
        notes: milestone.notes || '',
      });
    }
  }, [milestone]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        milestone_type: form.milestone_type,
        description: form.description,
        observed_date: form.observed_date,
        age_in_months: form.age_in_months ? parseInt(form.age_in_months) : undefined,
        notes: form.notes || undefined,
      };
      await onSubmit(payload);
      if (!milestone) {
        setForm({
          milestone_type: 'gross_motor',
          description: '',
          observed_date: '',
          age_in_months: '',
          notes: '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save milestone.');
    }
  }

  const milestoneTypeLabels = {
    gross_motor: 'Gross Motor (sitting, crawling, walking)',
    fine_motor: 'Fine Motor (grasping, pinching)',
    language: 'Language (babbling, words, sentences)',
    cognitive: 'Cognitive (memory, problem-solving)',
    social_emotional: 'Social & Emotional (smiling, interaction)',
  };

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label>
        Milestone Type
        <select
          value={form.milestone_type}
          onChange={(e) => setForm({ ...form, milestone_type: e.target.value as any })}
        >
          {Object.entries(milestoneTypeLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Description
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="e.g., Sat without support for 30 seconds"
          required
          maxLength={300}
        />
      </label>

      <label>
        Date Observed
        <input
          type="date"
          value={form.observed_date}
          onChange={(e) => setForm({ ...form, observed_date: e.target.value })}
          required
        />
      </label>

      <label>
        Age in Months
        <input
          type="number"
          min="0"
          max="120"
          value={form.age_in_months}
          onChange={(e) => setForm({ ...form, age_in_months: e.target.value })}
          placeholder="Optional: baby's age when milestone achieved"
        />
      </label>

      <label>
        Notes
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Additional details about the milestone"
        />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving…' : milestone ? 'Update Milestone' : 'Record Milestone'}
      </button>

      {milestone && onCancel && (
        <button type="button" className="link-button cancel-button" onClick={onCancel}>
          Cancel editing
        </button>
      )}
    </form>
  );
};

export default MilestoneForm;
