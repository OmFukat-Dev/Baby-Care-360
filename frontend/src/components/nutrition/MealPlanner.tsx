import React, { useState, useEffect } from 'react';
import { MealPlan } from '../../types';

interface MealPlannerProps {
  mealPlan?: MealPlan;
  onSubmit: (data: Partial<MealPlan>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const MealPlanner: React.FC<MealPlannerProps> = ({
  mealPlan,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form, setForm] = useState({
    week_start_date: '',
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (mealPlan) {
      setForm({
        week_start_date: mealPlan.week_start_date,
        monday: mealPlan.monday || '',
        tuesday: mealPlan.tuesday || '',
        wednesday: mealPlan.wednesday || '',
        thursday: mealPlan.thursday || '',
        friday: mealPlan.friday || '',
        saturday: mealPlan.saturday || '',
        sunday: mealPlan.sunday || '',
        notes: mealPlan.notes || '',
      });
    }
  }, [mealPlan]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        week_start_date: form.week_start_date,
        monday: form.monday || undefined,
        tuesday: form.tuesday || undefined,
        wednesday: form.wednesday || undefined,
        thursday: form.thursday || undefined,
        friday: form.friday || undefined,
        saturday: form.saturday || undefined,
        sunday: form.sunday || undefined,
        notes: form.notes || undefined,
      };
      await onSubmit(payload);
      if (!mealPlan) {
        setForm({
          week_start_date: '',
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: '',
          sunday: '',
          notes: '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save meal plan.');
    }
  }

  return (
    <form className="form-stack meal-planner-form" onSubmit={handleSubmit}>
      <label>
        Week Starting
        <input
          type="date"
          value={form.week_start_date}
          onChange={(e) => setForm({ ...form, week_start_date: e.target.value })}
          required
        />
      </label>

      <div className="days-grid">
        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
          (day) => (
            <label key={day}>
              {day.charAt(0).toUpperCase() + day.slice(1)}
              <textarea
                value={form[day as keyof typeof form] as string}
                onChange={(e) => setForm({ ...form, [day]: e.target.value })}
                placeholder={`Enter meals for ${day}`}
                rows={3}
              />
            </label>
          )
        )}
      </div>

      <label>
        Notes
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Tips for age-appropriate feeding, allergies to avoid, etc."
          rows={3}
        />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving…' : mealPlan ? 'Update Meal Plan' : 'Create Meal Plan'}
      </button>

      {mealPlan && onCancel && (
        <button type="button" className="link-button cancel-button" onClick={onCancel}>
          Cancel editing
        </button>
      )}
    </form>
  );
};

export default MealPlanner;
