import React from 'react';
import { Baby } from '../../types';
import BabyCard from './BabyCard';

interface BabyListProps {
  babies: Baby[];
  loading: boolean;
  onEdit: (baby: Baby) => void;
  onDelete: (id: number) => void;
}

const BabyList: React.FC<BabyListProps> = ({ babies, loading, onEdit, onDelete }) => {
  return (
    <div>
      <h2>Baby profiles</h2>
      {loading ? (
        <p className="subtext">Loading profiles…</p>
      ) : babies.length ? (
        <div className="baby-list">
          {babies.map((baby, index) => (
            <BabyCard
              key={baby.id}
              baby={baby}
              variantClass={`baby-card-${index % 4}`}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No baby profiles yet. Add your child's first profile to get started.
        </div>
      )}
    </div>
  );
};

export default BabyList;
