import React, { useState, useEffect } from 'react';
import { FoodIntroduction } from '../../types';

interface FoodIntroductionFormProps {
  record?: FoodIntroduction;
  onSubmit: (data: Partial<FoodIntroduction>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const FoodIntroductionForm: React.FC<FoodIntroductionFormProps> = ({
  record,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form, setForm] = useState({
    date: '',
    food_name: '',
    food_group: '',
    preparation: '',
    texture: '',
    amount: '',
    reaction: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setForm({
        date: record.date,
        food_name: record.food_name,
        food_group: record.food_group || '',
        preparation: record.preparation || '',
        texture: record.texture || '',
        amount: record.amount || '',
        reaction: record.reaction || '',
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
        food_name: form.food_name,
        food_group: form.food_group || undefined,
        preparation: form.preparation || undefined,
        texture: form.texture || undefined,
        amount: form.amount || undefined,
        reaction: form.reaction || undefined,
        notes: form.notes || undefined,
      };
      await onSubmit(payload);
      if (!record) {
        setForm({
          date: '',
          food_name: '',
          food_group: '',
          preparation: '',
          texture: '',
          amount: '',
          reaction: '',
          notes: '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save food introduction.');
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
        Food Name
        <input
          type="text"
          value={form.food_name}
          onChange={(e) => setForm({ ...form, food_name: e.target.value })}
          placeholder="e.g., Apple, Rice cereal, Egg yolk"
          required
        />
      </label>

      <label>
        Food Group
        <select
          value={form.food_group}
          onChange={(e) => setForm({ ...form, food_group: e.target.value })}
        >
          <option value="">Select food group</option>
          <option value="grains">Grains</option>
          <option value="fruits">Fruits</option>
          <option value="vegetables">Vegetables</option>
          <option value="proteins">Proteins</option>
          <option value="dairy">Dairy</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label>
        Preparation
        <input
          type="text"
          value={form.preparation}
          onChange={(e) => setForm({ ...form, preparation: e.target.value })}
          placeholder="e.g., Steamed and mashed, Puree, Finely chopped"
        />
      </label>

      <label>
        Texture
        <select
          value={form.texture}
          onChange={(e) => setForm({ ...form, texture: e.target.value })}
        >
          <option value="">Select texture</option>
          <option value="smooth">Smooth puree</option>
          <option value="lumpy">Lumpy</option>
          <option value="mashed">Mashed</option>
          <option value="chunky">Chunky</option>
          <option value="finger_food">Finger food</option>
        </select>
      </label>

      <label>
        Amount
        <input
          type="text"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="e.g., 1 tablespoon, Small bite"
        />
      </label>

      <label>
        Reaction
        <select
          value={form.reaction}
          onChange={(e) => setForm({ ...form, reaction: e.target.value })}
        >
          <option value="">Select reaction</option>
          <option value="well tolerated">Well tolerated</option>
          <option value="rash">Rash</option>
          <option value="vomiting">Vomiting</option>
          <option value="diarrhea">Diarrhea</option>
          <option value="constipation">Constipation</option>
        </select>
      </label>

      <label>
        Notes
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Additional observations or concerns"
        />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving…' : record ? 'Update Record' : 'Record Food Introduction'}
      </button>

      {record && onCancel && (
        <button type="button" className="link-button cancel-button" onClick={onCancel}>
          Cancel editing
        </button>
      )}
    </form>
  );
};

export default FoodIntroductionForm;
