import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Apple, Moon, TrendingUp, Pill } from 'lucide-react';

interface QuickActionFABProps {
  currentBabyId?: number;
}

export const QuickActionFAB: React.FC<QuickActionFABProps> = ({ currentBabyId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    setIsOpen(false);
    if (currentBabyId) {
      navigate(path);
    } else {
      navigate('/');
    }
  };

  const id = currentBabyId || 1;

  return (
    <>
      {isOpen && (
        <div 
          className="kido-fab-backdrop" 
          onClick={() => setIsOpen(false)} 
          aria-label="Close speed dial"
        />
      )}

      <div className="kido-fab-container">
        {isOpen && (
          <div className="kido-fab-menu" role="menu">
            <button
              className="kido-fab-item"
              onClick={() => handleAction(`/nutrition/${id}`)}
              role="menuitem"
            >
              <span className="kido-fab-item-label">🍼 Log Feed / Meal</span>
              <div className="kido-fab-item-icon kido-fab-icon-feed">
                <Apple size={20} />
              </div>
            </button>

            <button
              className="kido-fab-item"
              onClick={() => handleAction(`/development/${id}`)}
              role="menuitem"
            >
              <span className="kido-fab-item-label">💤 Track Sleep</span>
              <div className="kido-fab-item-icon kido-fab-icon-sleep">
                <Moon size={20} />
              </div>
            </button>

            <button
              className="kido-fab-item"
              onClick={() => handleAction(`/growth/${id}`)}
              role="menuitem"
            >
              <span className="kido-fab-item-label">⚖️ Record Growth</span>
              <div className="kido-fab-item-icon kido-fab-icon-weight">
                <TrendingUp size={20} />
              </div>
            </button>

            <button
              className="kido-fab-item"
              onClick={() => handleAction(`/development/${id}`)}
              role="menuitem"
            >
              <span className="kido-fab-item-label">💊 Log Prescription</span>
              <div className="kido-fab-item-icon kido-fab-icon-medicine">
                <Pill size={20} />
              </div>
            </button>
          </div>
        )}

        <button
          className={`kido-fab-button ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Quick Care Actions"
          title="Quick Care Actions"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </div>
    </>
  );
};

export default QuickActionFAB;
