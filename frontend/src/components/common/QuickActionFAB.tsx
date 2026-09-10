import React, { useState } from 'react';
import { Plus, Apple, Moon, TrendingUp, Pill } from 'lucide-react';
import QuickLogModal, { QuickLogTab } from './QuickLogModal';

interface QuickActionFABProps {
  currentBabyId?: number;
  onLoggedSuccess?: () => void;
}

export const QuickActionFAB: React.FC<QuickActionFABProps> = ({ currentBabyId, onLoggedSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quickLogTab, setQuickLogTab] = useState<QuickLogTab | null>(null);

  const openQuickLog = (tab: QuickLogTab) => {
    setIsOpen(false);
    setQuickLogTab(tab);
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

      {/* Instant 1-Tap Quick Logger Modal */}
      {quickLogTab && (
        <QuickLogModal
          isOpen={true}
          initialTab={quickLogTab}
          babyId={id}
          onClose={() => setQuickLogTab(null)}
          onSuccess={() => {
            onLoggedSuccess?.();
            window.location.reload(); // Quick refresh if on the active page
          }}
        />
      )}

      <div className="kido-fab-container">
        {isOpen && (
          <div className="kido-fab-menu" role="menu">
            <button
              className="kido-fab-item"
              onClick={() => openQuickLog('feed')}
              role="menuitem"
            >
              <span className="kido-fab-item-label">🍼 1-Tap Quick Feed</span>
              <div className="kido-fab-item-icon kido-fab-icon-feed">
                <Apple size={20} />
              </div>
            </button>

            <button
              className="kido-fab-item"
              onClick={() => openQuickLog('sleep')}
              role="menuitem"
            >
              <span className="kido-fab-item-label">💤 1-Tap Quick Sleep</span>
              <div className="kido-fab-item-icon kido-fab-icon-sleep">
                <Moon size={20} />
              </div>
            </button>

            <button
              className="kido-fab-item"
              onClick={() => openQuickLog('growth')}
              role="menuitem"
            >
              <span className="kido-fab-item-label">⚖️ 1-Tap Quick Growth</span>
              <div className="kido-fab-item-icon kido-fab-icon-weight">
                <TrendingUp size={20} />
              </div>
            </button>

            <button
              className="kido-fab-item"
              onClick={() => openQuickLog('medicine')}
              role="menuitem"
            >
              <span className="kido-fab-item-label">💊 1-Tap Quick Medicine</span>
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
