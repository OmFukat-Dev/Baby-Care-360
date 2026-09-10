import React, { useState } from 'react';
import { X, Apple, Moon, TrendingUp, Pill, Check, Plus, Minus } from 'lucide-react';
import { feedingApi, sleepApi, growthApi, medicineApi } from '../../services/api';

export type QuickLogTab = 'feed' | 'sleep' | 'growth' | 'medicine';

interface QuickLogModalProps {
  isOpen: boolean;
  initialTab?: QuickLogTab;
  babyId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  initialTab = 'feed',
  babyId = 1,
  onClose,
  onSuccess
}) => {
  const [tab, setTab] = useState<QuickLogTab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Feeding state
  const [feedingType, setFeedingType] = useState<'breast_milk' | 'formula' | 'solids'>('formula');
  const [feedAmount, setFeedAmount] = useState<number>(120); // ml

  // 2. Sleep state
  const [sleepType, setSleepType] = useState<'nap' | 'night_sleep'>('nap');
  const [sleepMinutes, setSleepMinutes] = useState<number>(45);

  // 3. Growth state
  const [weight, setWeight] = useState<number>(7.2);
  const [height, setHeight] = useState<number>(65.0);

  // 4. Medicine state
  const [medicineName, setMedicineName] = useState('Vitamin D Drops');
  const [dosage, setDosage] = useState('400 IU (1 drop)');

  if (!isOpen) return null;

  const triggerCelebration = (msg: string) => {
    window.dispatchEvent(new CustomEvent('babycare-celebrate', { detail: { message: msg } }));
  };

  const handleSaveFeed = async () => {
    try {
      setLoading(true);
      setError('');
      const today = new Date().toISOString().split('T')[0];
      const time = new Date().toTimeString().slice(0, 5);

      await feedingApi.create(babyId, {
        date: today,
        time: time,
        feeding_type: feedingType,
        amount_ml: feedingType !== 'solids' ? feedAmount : undefined,
        solid_food_name: feedingType === 'solids' ? 'Fruit Puree' : undefined,
      });

      triggerCelebration('🍼 Feeding successfully logged!');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save feeding log.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSleep = async () => {
    try {
      setLoading(true);
      setError('');
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const startTime = new Date(now.getTime() - sleepMinutes * 60000).toTimeString().slice(0, 5);
      const endTime = now.toTimeString().slice(0, 5);

      await sleepApi.create(babyId, {
        date: today,
        sleep_type: sleepType,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: sleepMinutes,
      });

      triggerCelebration('💤 Sleep rest recorded!');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save sleep record.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrowth = async () => {
    try {
      setLoading(true);
      setError('');
      const today = new Date().toISOString().split('T')[0];

      await growthApi.create(babyId, {
        measurement_date: today,
        weight: weight,
        height: height,
      });

      triggerCelebration('⚖️ Growth measurement saved!');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save growth log.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMedicine = async () => {
    try {
      setLoading(true);
      setError('');
      const today = new Date().toISOString().split('T')[0];

      await medicineApi.create(babyId, {
        medicine_name: medicineName,
        dosage: dosage,
        start_date: today,
        frequency: 'once_daily',
      });

      triggerCelebration('💊 Prescription dose recorded!');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save medicine record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kido-modal-overlay" onClick={onClose}>
      <div className="kido-quick-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="quick-modal-header">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.25rem' }}>⚡</span>
            <h3 className="text-lg font-bold text-white m-0" style={{ fontFamily: 'Outfit, Plus Jakarta Sans' }}>
              Quick Care Logger
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 border-none cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="quick-modal-tab-bar">
          <button
            onClick={() => setTab('feed')}
            className={`quick-modal-tab-btn ${tab === 'feed' ? 'active' : ''}`}
          >
            <Apple size={16} />
            <span>Feed</span>
          </button>

          <button
            onClick={() => setTab('sleep')}
            className={`quick-modal-tab-btn ${tab === 'sleep' ? 'active' : ''}`}
          >
            <Moon size={16} />
            <span>Sleep</span>
          </button>

          <button
            onClick={() => setTab('growth')}
            className={`quick-modal-tab-btn ${tab === 'growth' ? 'active' : ''}`}
          >
            <TrendingUp size={16} />
            <span>Growth</span>
          </button>

          <button
            onClick={() => setTab('medicine')}
            className={`quick-modal-tab-btn ${tab === 'medicine' ? 'active' : ''}`}
          >
            <Pill size={16} />
            <span>Medicine</span>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
            {error}
          </div>
        )}

        {/* Body Content */}
        <div className="quick-modal-body">
          {/* TAB 1: FEEDING */}
          {tab === 'feed' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Feeding Category</label>
                <div className="quick-preset-chips">
                  {[
                    { key: 'formula', label: '🍼 Formula Milk' },
                    { key: 'breast_milk', label: '🤱 Breast Milk' },
                    { key: 'solids', label: '🥣 Solids / Puree' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setFeedingType(item.key as any)}
                      className={`quick-preset-chip ${feedingType === item.key ? 'active' : ''}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {feedingType !== 'solids' ? (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Amount in Milliliters</label>
                  <div className="quick-num-stepper">
                    <button 
                      onClick={() => setFeedAmount(Math.max(30, feedAmount - 15))}
                      className="quick-num-stepper-btn"
                    >
                      <Minus size={18} />
                    </button>
                    <div className="quick-num-value">{feedAmount} <span className="text-sm font-semibold text-slate-400">ml</span></div>
                    <button 
                      onClick={() => setFeedAmount(feedAmount + 15)}
                      className="quick-num-stepper-btn"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="quick-preset-chips justify-center mt-2">
                    {[60, 90, 120, 150, 180, 210].map(val => (
                      <button
                        key={val}
                        onClick={() => setFeedAmount(val)}
                        className={`quick-preset-chip ${feedAmount === val ? 'active' : ''}`}
                      >
                        {val} ml
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 text-sky-800 text-xs font-medium">
                  🥑 Recording complementary solid meal introduction for today's nutrition log.
                </div>
              )}
            </>
          )}

          {/* TAB 2: SLEEP */}
          {tab === 'sleep' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Sleep Period</label>
                <div className="quick-preset-chips">
                  {[
                    { key: 'nap', label: '🛌 Daytime Nap' },
                    { key: 'night_sleep', label: '🌙 Night Sleep' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setSleepType(item.key as any)}
                      className={`quick-preset-chip ${sleepType === item.key ? 'active' : ''}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Duration in Minutes</label>
                <div className="quick-num-stepper">
                  <button 
                    onClick={() => setSleepMinutes(Math.max(15, sleepMinutes - 15))}
                    className="quick-num-stepper-btn"
                  >
                    <Minus size={18} />
                  </button>
                  <div className="quick-num-value">{sleepMinutes} <span className="text-sm font-semibold text-slate-400">mins</span></div>
                  <button 
                    onClick={() => setSleepMinutes(sleepMinutes + 15)}
                    className="quick-num-stepper-btn"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="quick-preset-chips justify-center mt-2">
                  {[30, 45, 60, 90, 120].map(mins => (
                    <button
                      key={mins}
                      onClick={() => setSleepMinutes(mins)}
                      className={`quick-preset-chip ${sleepMinutes === mins ? 'active' : ''}`}
                    >
                      {mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 ? `${mins % 60}m` : ''}` : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 3: GROWTH */}
          {tab === 'growth' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Weight (kg)</label>
                <div className="quick-num-stepper">
                  <button 
                    onClick={() => setWeight(parseFloat((weight - 0.1).toFixed(1)))}
                    className="quick-num-stepper-btn"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="text-xl font-extrabold text-slate-800">{weight} <span className="text-xs font-bold text-slate-400">kg</span></div>
                  <button 
                    onClick={() => setWeight(parseFloat((weight + 0.1).toFixed(1)))}
                    className="quick-num-stepper-btn"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Height (cm)</label>
                <div className="quick-num-stepper">
                  <button 
                    onClick={() => setHeight(parseFloat((height - 0.5).toFixed(1)))}
                    className="quick-num-stepper-btn"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="text-xl font-extrabold text-slate-800">{height} <span className="text-xs font-bold text-slate-400">cm</span></div>
                  <button 
                    onClick={() => setHeight(parseFloat((height + 0.5).toFixed(1)))}
                    className="quick-num-stepper-btn"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEDICINE */}
          {tab === 'medicine' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Prescription Medication</label>
                <div className="quick-preset-chips mb-2">
                  {['Vitamin D Drops', 'Paracetamol Syrup', 'Oral Rehydration', 'Teething Gel'].map(name => (
                    <button
                      key={name}
                      onClick={() => setMedicineName(name)}
                      className={`quick-preset-chip ${medicineName === name ? 'active' : ''}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={medicineName} 
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="Medicine name"
                  className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Dosage</label>
                <input 
                  type="text" 
                  value={dosage} 
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 1 drop (400 IU) or 2.5 ml"
                  className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="quick-modal-footer">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-200 bg-transparent border-none cursor-pointer"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={() => {
              if (tab === 'feed') handleSaveFeed();
              else if (tab === 'sleep') handleSaveSleep();
              else if (tab === 'growth') handleSaveGrowth();
              else if (tab === 'medicine') handleSaveMedicine();
            }}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-sky-500/25"
          >
            <Check size={16} />
            <span>{loading ? 'Logging...' : 'Save Quick Entry'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickLogModal;
