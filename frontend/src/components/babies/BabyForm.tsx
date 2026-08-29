import React, { useState, useEffect } from 'react';
import { Baby } from '../../types';

interface BabyFormProps {
  baby?: Baby;
  onSubmit: (data: Partial<Baby>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const emptyBaby = {
  name: '',
  date_of_birth: '',
  gender: '',
  birth_weight: '',
  birth_length: '',
};

const BabyForm: React.FC<BabyFormProps> = ({ baby, onSubmit, onCancel, isLoading = false }) => {
  const [form, setForm] = useState<any>(emptyBaby);
  const [error, setError] = useState('');

  useEffect(() => {
    if (baby) {
      setForm({
        name: baby.name,
        date_of_birth: baby.date_of_birth,
        gender: baby.gender || '',
        birth_weight: baby.birth_weight || '',
        birth_length: baby.birth_length || '',
      });
    }
  }, [baby]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        birth_weight: form.birth_weight ? Number(form.birth_weight) : null,
        birth_length: form.birth_length ? Number(form.birth_length) : null,
      };
      await onSubmit(payload);
      if (!baby) {
        setForm(emptyBaby);
      }
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Could not save the baby profile.');
    }
  }

  return (
    <section className="add-profile">
      <h2>{baby ? 'Edit baby profile' : 'Add a baby'}</h2>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            maxLength={100}
            required
          />
        </label>
        <label>
          Date of birth
          <input
            name="date_of_birth"
            type="date"
            value={form.date_of_birth}
            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
            max={new Date().toISOString().slice(0, 10)}
            required
          />
        </label>
        <div className="form-row">
          <label>
            Gender
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">Not specified</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Birth weight (kg)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.birth_weight}
              onChange={(e) => setForm({ ...form, birth_weight: e.target.value })}
            />
          </label>
        </div>
        <label>
          Birth length (cm)
          <input
            type="number"
            min="0"
            step="0.1"
            value={form.birth_length}
            onChange={(e) => setForm({ ...form, birth_length: e.target.value })}
          />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving…' : baby ? 'Save changes' : 'Save baby profile'}
        </button>
        {baby && onCancel && (
          <button type="button" className="link-button cancel-button" onClick={onCancel}>
            Cancel editing
          </button>
        )}
      </form>
    </section>
  );
};

export default BabyForm;
