import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { milestoneApi, sleepApi, medicineApi, babyApi } from '../services/api';
import { Milestone, SleepRecord, MedicineRecord, Baby } from '../types';
import Layout from '../components/layout/Layout';
import MilestoneForm from '../components/development/MilestoneForm';
import SleepForm from '../components/development/SleepForm';
import SleepLog from '../components/development/SleepLog';
import MedicineForm from '../components/development/MedicineForm';
import MedicineList from '../components/development/MedicineList';
import { 
  ChevronLeft, 
  Moon, 
  Plus, 
  CheckCircle2
} from 'lucide-react';

type Tab = 'milestones' | 'sleep' | 'medicines';

const DevelopmentPage: React.FC = () => {
  const { babyId } = useParams<{ babyId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('milestones');
  const [baby, setBaby] = useState<Baby | undefined>();

  // Milestone state
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>();
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  // Sleep state
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [editingSleep, setEditingSleep] = useState<SleepRecord | undefined>();
  const [showSleepForm, setShowSleepForm] = useState(false);

  // Medicine state
  const [medicines, setMedicines] = useState<MedicineRecord[]>([]);
  const [editingMedicine, setEditingMedicine] = useState<MedicineRecord | undefined>();
  const [showMedicineForm, setShowMedicineForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!babyId) return;
    loadAllData();
  }, [babyId]);

  async function loadAllData() {
    try {
      setLoading(true);
      setError('');

      // Load baby details
      const babyRes = await babyApi.getById(Number(babyId));
      setBaby(babyRes.data.baby);

      // Load lists
      const [milRes, sleepRes, medRes] = await Promise.all([
        milestoneApi.getAll(Number(babyId)),
        sleepApi.getAll(Number(babyId)),
        medicineApi.getAll(Number(babyId)),
      ]);

      setMilestones(milRes.data.records || []);
      setSleepRecords(sleepRes.data.records || []);
      setMedicines(medRes.data.records || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load development data.');
    } finally {
      setLoading(false);
    }
  }

  // Calculate age string dynamically
  function calculateAge(birthDateString: string) {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const totalMonths = years * 12 + months;
    return `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
  }

  // Calculate total sleep hours in last 24h / all records
  const totalSleepTracked = useMemo(() => {
    let totalMinutes = 0;
    sleepRecords.forEach(record => {
      if (record.duration_minutes) {
        totalMinutes += record.duration_minutes;
      }
    });
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}h ${mins}m`;
  }, [sleepRecords]);

  // Milestone handlers
  async function saveMilestone(data: Partial<Milestone>) {
    try {
      setError('');
      if (editingMilestone) {
        const response = await milestoneApi.update(Number(babyId), editingMilestone.id, data);
        setMilestones((current) =>
          current.map((m) => (m.id === editingMilestone.id ? response.data.record : m))
        );
        setEditingMilestone(undefined);
      } else {
        const response = await milestoneApi.create(Number(babyId), data);
        setMilestones((current) => [response.data.record, ...current]);
      }
      setShowMilestoneForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save milestone.');
      throw err;
    }
  }

  // Sleep handlers
  async function saveSleep(data: Partial<SleepRecord>) {
    try {
      setError('');
      if (editingSleep) {
        const response = await sleepApi.update(Number(babyId), editingSleep.id, data);
        setSleepRecords((current) =>
          current.map((r) => (r.id === editingSleep.id ? response.data.record : r))
        );
        setEditingSleep(undefined);
      } else {
        const response = await sleepApi.create(Number(babyId), data);
        setSleepRecords((current) => [response.data.record, ...current]);
      }
      setShowSleepForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save sleep record.');
      throw err;
    }
  }

  async function deleteSleep(id: number) {
    try {
      setError('');
      await sleepApi.delete(Number(babyId), id);
      setSleepRecords((current) => current.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete sleep record.');
    }
  }

  // Medicine handlers
  async function saveMedicine(data: Partial<MedicineRecord>) {
    try {
      setError('');
      if (editingMedicine) {
        const response = await medicineApi.update(Number(babyId), editingMedicine.id, data);
        setMedicines((current) =>
          current.map((m) => (m.id === editingMedicine.id ? response.data.record : m))
        );
        setEditingMedicine(undefined);
      } else {
        const response = await medicineApi.create(Number(babyId), data);
        setMedicines((current) => [response.data.record, ...current]);
      }
      setShowMedicineForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save medicine record.');
      throw err;
    }
  }

  async function deleteMedicine(id: number) {
    try {
      setError('');
      await medicineApi.delete(Number(babyId), id);
      setMedicines((current) => current.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete medicine record.');
    }
  }

  // Group milestones by developmental category
  const categorizedMilestones = useMemo(() => {
    const categories: { [key: string]: Milestone[] } = {
      'Gross Motor': [],
      'Fine Motor': [],
      'Language': [],
      'Cognitive': [],
      'Social & Emotional': []
    };

    const typeMapping: { [key: string]: string } = {
      'gross_motor': 'Gross Motor',
      'fine_motor': 'Fine Motor',
      'language': 'Language',
      'cognitive': 'Cognitive',
      'social_emotional': 'Social & Emotional'
    };

    milestones.forEach(m => {
      const mapped = typeMapping[m.milestone_type] || 'Cognitive';
      categories[mapped].push(m);
    });

    return categories;
  }, [milestones]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col gap-4 py-8">
          <div className="h-8 bg-slate-100 animate-pulse rounded w-1/4"></div>
          <div className="h-12 bg-slate-100 animate-pulse rounded-full max-w-md"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="h-64 bg-slate-100 animate-pulse rounded-3xl"></div>
            <div className="h-64 bg-slate-100 animate-pulse rounded-3xl"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Banner Section with Floating Shapes & Cloud Transition */}
      <section className="kido-page-hero">
        <div className="kido-floating-shapes">
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
        </div>

        <div className="kido-page-hero-inner">
          <div className="kido-page-hero-content">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <button 
                onClick={() => navigate('/')} 
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white text-xs font-bold transition-all cursor-pointer border border-white/30 shadow-sm"
              >
                <ChevronLeft size={14} />
                <span>Dashboard</span>
              </button>
              <span className="kido-hero-badge">
                🧠 Cognitive, Sleep & Care
              </span>
            </div>

            <h1 className="kido-page-hero-title">
              Development & Daily Routines
            </h1>

            <p className="kido-page-hero-desc">
              {baby 
                ? `Monitor developmental milestones, nap cycles, and prescription dosages for ${baby.name}.`
                : "Track cognitive and motor milestones, sleep duration, and pediatric prescriptions."}
            </p>

            {/* Micro Stats Chips Row */}
            <div className="kido-page-hero-chips">
              {baby && (
                <>
                  <span className="kido-hero-chip">
                    👶 {baby.name}
                  </span>
                  <span className="kido-hero-chip">
                    🎂 {calculateAge(baby.date_of_birth)}
                  </span>
                </>
              )}
              <span className="kido-hero-chip success">
                🧸 {milestones.length} Milestones Logged
              </span>
              <span className="kido-hero-chip">
                💤 {totalSleepTracked} Sleep Tracked
              </span>

              {activeTab === 'milestones' && (
                <button
                  onClick={() => {
                    setEditingMilestone(undefined);
                    setShowMilestoneForm(!showMilestoneForm);
                  }}
                  className="kido-hero-chip accent cursor-pointer hover-scale border-none"
                >
                  <Plus size={14} />
                  <span>{showMilestoneForm ? 'Close Form' : 'Log Milestone'}</span>
                </button>
              )}
              {activeTab === 'sleep' && (
                <button
                  onClick={() => {
                    setEditingSleep(undefined);
                    setShowSleepForm(!showSleepForm);
                  }}
                  className="kido-hero-chip accent cursor-pointer hover-scale border-none"
                >
                  <Plus size={14} />
                  <span>{showSleepForm ? 'Close Form' : 'Log Sleep'}</span>
                </button>
              )}
              {activeTab === 'medicines' && (
                <button
                  onClick={() => {
                    setEditingMedicine(undefined);
                    setShowMedicineForm(!showMedicineForm);
                  }}
                  className="kido-hero-chip accent cursor-pointer hover-scale border-none"
                >
                  <Plus size={14} />
                  <span>{showMedicineForm ? 'Close Form' : 'Record Medicine'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Wobbly Frame Hero Visual */}
          <div className="kido-page-hero-media wobbly-frame">
            <img src="/baby-development.jpg" alt="Baby developmental milestones" />
          </div>
        </div>

        {/* Cloud Transition Divider at Bottom */}
        <div className="kido-cloud-container">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,224L48,229.3C96,235,192,245,288,234.7C384,224,480,192,576,192C672,192,768,224,864,229.3C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {error && <div className="error-banner mb-6">{error}</div>}

      {/* Tabs list */}
      <div className="flex border-b border-slate-200/80 mb-8 gap-6">
        {[
          { key: 'milestones', label: '🧸 Milestones' },
          { key: 'sleep', label: '💤 Sleep Log' },
          { key: 'medicines', label: '💊 Prescribed Medicines' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
            className={`pb-4 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer bg-transparent border-none ${activeTab === tab.key ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Milestones Tab */}
      {activeTab === 'milestones' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Form overlay */}
            {showMilestoneForm && (
              <div className="kido-glass-card p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">{editingMilestone ? 'Edit Milestone Record' : 'Log Milestone Achievement'}</h3>
                <MilestoneForm
                  milestone={editingMilestone}
                  onSubmit={saveMilestone}
                  onCancel={() => setShowMilestoneForm(false)}
                />
              </div>
            )}

            {/* Categorized Milestones listings */}
            <div className="kido-glass-card p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Development Checklist</h3>
              
              <div className="flex flex-col gap-6">
                {Object.keys(categorizedMilestones).map(category => {
                  const items = categorizedMilestones[category];
                  if (items.length === 0) return null;
                  return (
                    <div key={category} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                      <h4 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-violet-500" />
                        <span>{category}</span>
                      </h4>

                      <div className="flex flex-col gap-2 pl-4">
                        {items.map(m => (
                          <div key={m.id} className="p-3 border border-slate-50 bg-slate-50/20 rounded-xl flex justify-between items-center text-sm font-semibold">
                            <div>
                              <span className="text-slate-800 font-bold block">{m.description}</span>
                              {m.notes && <span className="text-xs text-slate-400 font-medium block mt-1">{m.notes}</span>}
                            </div>
                            <span className="text-xs font-bold text-violet-600 px-2.5 py-0.5 bg-violet-50 rounded-full">
                              Achieved {new Date(m.observed_date).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {milestones.length === 0 && (
                  <div className="text-center py-12">
                    <span className="text-4xl block mb-2">🧸</span>
                    <p className="text-sm font-semibold text-slate-600">No milestones achieved yet</p>
                    <p className="text-xs text-slate-400 mt-1">Log achievements like first smile, crawling, or words</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="kido-glass-card p-6 h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>Developmental Advice</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4">
              General milestone guidelines are derived from standard rules-based guidelines. They help monitor basic patterns.
            </p>
            <div className="p-4 bg-violet-50/70 rounded-2xl border border-violet-100 text-xs font-semibold text-violet-900 flex gap-3">
              <span className="text-xl">🩺</span>
              <div>
                <span className="font-bold block mb-1">Pediatric reminder</span>
                This tracking sheet represents general milestone progress records, and should not replace professional medical diagnosis from your pediatrician.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Sleep Tracking Tab */}
      {activeTab === 'sleep' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Summary card */}
            <div className="kido-glass-card p-6 flex items-center gap-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-indigo-100">
                <Moon size={22} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Total Sleep Tracked</span>
                <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalSleepTracked}</span>
              </div>
            </div>

            {/* Sleep Form overlay */}
            {showSleepForm && (
              <div className="kido-glass-card p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">{editingSleep ? 'Edit Sleep Record entry' : 'Log Sleep Session entry'}</h3>
                <SleepForm
                  record={editingSleep}
                  onSubmit={saveSleep}
                  onCancel={() => setShowSleepForm(false)}
                />
              </div>
            )}

            {/* Sleep logs list */}
            <div className="kido-glass-card p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Recent Sleep Logs</h3>
              <SleepLog
                records={sleepRecords}
                onEdit={(r) => {
                  setEditingSleep(r);
                  setShowSleepForm(true);
                }}
                onDelete={deleteSleep}
              />
            </div>

          </div>

          <div className="kido-glass-card p-6 h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Sleep Guidance</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4">
              Consistently logging sleeping schedules allows parents to understand sleep trends, helping optimize naps.
            </p>
          </div>
        </div>
      )}

      {/* 3. Medicines Tab */}
      {activeTab === 'medicines' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Medicine Form overlay */}
            {showMedicineForm && (
              <div className="kido-glass-card p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">{editingMedicine ? 'Edit Medicine Schedule' : 'Record Medicine Dose'}</h3>
                <MedicineForm
                  record={editingMedicine}
                  onSubmit={saveMedicine}
                  onCancel={() => setShowMedicineForm(false)}
                />
              </div>
            )}

            {/* Medicines log list */}
            <div className="kido-glass-card p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Medicines Schedule</h3>
              
              {medicines.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl block mb-2">💊</span>
                  <p className="text-sm font-semibold text-slate-600">No prescribed medicines active</p>
                  <p className="text-xs text-slate-400 mt-1">Log prescribed doses for easy tracking</p>
                </div>
              ) : (
                <MedicineList
                  records={medicines}
                  onEdit={(m) => {
                    setEditingMedicine(m);
                    setShowMedicineForm(true);
                  }}
                  onDelete={deleteMedicine}
                />
              )}
            </div>

          </div>

          <div className="kido-glass-card p-6 h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Safety Reminder</h3>
            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100 text-xs font-semibold text-rose-900 flex gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <span className="font-bold block mb-1">Consult Pediatrician</span>
                Always verify prescription details and dosages with your licensed clinic or pharmacy.
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DevelopmentPage;
