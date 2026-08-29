import React from 'react';
import { Link } from 'react-router-dom';
import { Baby } from '../../types';
import { useFormat } from '../../hooks/useFormat';

interface BabyCardProps {
  baby: Baby;
  variantClass?: string;
  onEdit: (baby: Baby) => void;
  onDelete: (id: number) => void;
}

const BabyCard: React.FC<BabyCardProps> = ({ baby, variantClass = 'baby-card-0', onEdit, onDelete }) => {
  const { formatAge } = useFormat();

  return (
    <article className={`baby-card ${variantClass}`}>
      <Link to={`/baby/${baby.id}`} className="baby-card-link">
        <div>
          <h3>{baby.name}</h3>
          <p>{formatAge(baby.date_of_birth)} · {baby.gender || 'Gender not specified'}</p>
          {baby.birth_weight && <p>Birth weight: {baby.birth_weight} kg</p>}
          {baby.birth_length && <p>Birth length: {baby.birth_length} cm</p>}
        </div>
      </Link>
      <div className="profile-actions">
        <button className="edit-button" onClick={() => onEdit(baby)}>
          Edit
        </button>
        <button
          className="remove-button"
          onClick={() => {
            if (window.confirm('Remove this baby profile? This cannot be undone.')) {
              onDelete(baby.id);
            }
          }}
        >
          Remove
        </button>
      </div>
    </article>
  );
};

export default BabyCard;
