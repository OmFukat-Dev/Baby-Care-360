import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { growthApi, babyApi } from '../services/api';
import { GrowthMeasurement, Baby } from '../types';
import Layout from '../components/layout/Layout';
import GrowthForm from '../components/growth/GrowthForm';
import { 
  ChevronLeft, 
  Plus, 
  Edit, 
  Trash2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const GrowthPage: React.FC = () => {
  const { babyId } = useParams<{ babyId: string }>();
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState<GrowthMeasurement[]>([]);
  const [baby, setBaby] = useState<Baby | undefined>();
  const [editingMeasurement, setEditingMeasurement] = useState<GrowthMeasurement | undefined>();
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'weight' | 'height' | 'head'>('weight');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!babyId) return;
    loadInitialData();
  }, [babyId]);

  async function loadInitialData() {
    try {
      setLoading(true);
      setError('');
      
      // Load baby details
      const babyRes = await babyApi.getById(Number(babyId));
      setBaby(babyRes.data.baby);

      // Load growth records
      const response = await growthApi.getAll(Number(babyId));
      setMeasurements(response.data.records || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load growth data.');
    } finally {
      setLoading(false);
    }
  }

  async function saveMeasurement(data: Partial<GrowthMeasurement>) {
    try {
      setError('');
      if (editingMeasurement) {
        const response = await growthApi.update(Number(babyId), editingMeasurement.id, data);
        setMeasurements((current) =>
          current.map((m) =>
            m.id === editingMeasurement.id ? response.data.record : m
          )
        );
        setEditingMeasurement(undefined);
      } else {
        const response = await growthApi.create(Number(babyId), data);
        setMeasurements((current) => [...current, response.data.record]);
      }
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save measurement.');
      throw err;
    }
  }

  async function deleteMeasurement(id: number) {
    try {
      setError('');
      await growthApi.delete(Number(babyId), id);
      setMeasurements((current) => current.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete measurement.');
    }
  }

  // Calculate age string dynamically
  function calculateAge(birthDateString: string) {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    
    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    
    const totalMonths = years * 12 + months;
    if (totalMonths === 0) return `${days} days`;
    if (days === 0) return `${totalMonths} months`;
    return `${totalMonths}m ${days}d`;
  }

  // Get sorted list of records
  const sortedMeasurements = useMemo(() => {
    return [...measurements].sort(
      (a, b) => new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()
    );
  }, [measurements]);

  // Latest measurement values
  const latestMetric = useMemo(() => {
    if (sortedMeasurements.length === 0) return { weight: '--', height: '--', head: '--', date: '' };
    
    // Find latest measurements with actual values
    const latestWeight = [...sortedMeasurements].reverse().find(m => m.weight)?.weight || '--';
    const latestHeight = [...sortedMeasurements].reverse().find(m => m.height)?.height || '--';
    const latestHead = [...sortedMeasurements].reverse().find(m => m.head_circumference)?.head_circumference || '--';
    const latestDate = sortedMeasurements[sortedMeasurements.length - 1].measurement_date;

    return {
      weight: latestWeight,
      height: latestHeight,
      head: latestHead,
      date: latestDate ? new Date(latestDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''
    };
  }, [sortedMeasurements]);

  // Chart data points
  const chartData = useMemo(() => {
    return sortedMeasurements.map(m => ({
      date: new Date(m.measurement_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      Weight: m.weight,
      Height: m.height,
      'Head Circ.': m.head_circumference
    }));
  }, [sortedMeasurements]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col gap-4 py-8">
          <div className="h-8 bg-slate-100 animate-pulse rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-slate-100 animate-pulse rounded-2xl"></div>
            <div className="h-32 bg-slate-100 animate-pulse rounded-2xl"></div>
            <div className="h-32 bg-slate-100 animate-pulse rounded-2xl"></div>
          </div>
          <div className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
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
                📈 Physical Growth & Velocity
              </span>
            </div>

            <h1 className="kido-page-hero-title">
              Growth Monitoring & Curves
            </h1>

            <p className="kido-page-hero-desc">
              {baby 
                ? `Track ${baby.name}'s height, weight, and head circumference parameters against standard pediatric percentiles.`
                : "Monitor physical development and pediatric health curves over time."}
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
              <span className="kido-hero-chip">
                ⚖️ {latestMetric.weight} {latestMetric.weight !== '--' ? 'kg' : ''}
              </span>
              <span className="kido-hero-chip">
                📏 {latestMetric.height} {latestMetric.height !== '--' ? 'cm' : ''}
              </span>
              <button
                onClick={() => {
                  setEditingMeasurement(undefined);
                  setShowAddForm(!showAddForm);
                }}
                className="kido-hero-chip accent cursor-pointer hover-scale border-none"
              >
                <Plus size={14} />
                <span>{showAddForm ? 'Close Form' : 'Log Measurement'}</span>
              </button>
            </div>
          </div>

          {/* Right Wobbly Frame Hero Visual */}
          <div className="kido-page-hero-media wobbly-frame">
            <img src="/baby-growth.jpg" alt="Baby physical growth tracking" />
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

      {/* Profile metric cards summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Weight', value: latestMetric.weight, unit: 'kg', icon: '⚖️', color: 'border-l-sky-500', pill: 'var(--pastel-sky)' },
          { label: 'Height', value: latestMetric.height, unit: 'cm', icon: '📏', color: 'border-l-emerald-500', pill: 'var(--pastel-mint)' },
          { label: 'Head Circumference', value: latestMetric.head, unit: 'cm', icon: '🧠', color: 'border-l-violet-500', pill: 'var(--pastel-lilac)' }
        ].map((card, idx) => (
          <div key={idx} className={`kido-glass-card p-6 border-l-4 ${card.color}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">{card.label}</span>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm" style={{ background: card.pill }}>{card.icon}</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-slate-800">{card.value}</span>
              {card.value !== '--' && <span className="text-sm text-slate-400 font-bold">{card.unit}</span>}
            </div>
            {latestMetric.date ? (
              <span className="text-xs text-slate-400 font-medium block mt-3">Updated {latestMetric.date}</span>
            ) : (
              <span className="text-xs text-slate-400 font-medium block mt-3">No records entered</span>
            )}
          </div>
        ))}
      </div>

      {/* Record details form overlay */}
      {showAddForm && (
        <div className="kido-glass-card p-6 max-w-xl mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{editingMeasurement ? 'Edit Measurement Details' : 'New Measurement Log'}</h3>
          <GrowthForm
            measurement={editingMeasurement}
            onSubmit={saveMeasurement}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {sortedMeasurements.length === 0 ? (
        /* Empty State */
        <div className="kido-glass-card flex flex-col items-center justify-center py-16 px-6 text-center max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center text-3xl mb-6 shadow-inner">⚖️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No growth measurements yet</h2>
          <p className="text-slate-500 max-w-sm mb-6">
            Enter periodic weight, height, and head circumference parameters to monitor growth curves over time.
          </p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-all cursor-pointer text-sm shadow-lg shadow-sky-500/25"
          >
            Log First Measurement
          </button>
        </div>
      ) : (
        /* Charts and log tabs */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Trends Charts column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="kido-glass-card p-6">
              <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Growth Curves</h3>
                
                {/* Trend Tabs toggle */}
                <div className="flex border border-slate-200/80 rounded-full p-1 bg-slate-50">
                  {[
                    { key: 'weight', label: 'Weight' },
                    { key: 'height', label: 'Height' },
                    { key: 'head', label: 'Head' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeTab === tab.key ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line chart widget */}
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ borderRadius: '14px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} />
                    {activeTab === 'weight' && (
                      <Line type="monotone" dataKey="Weight" name="Weight (kg)" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
                    )}
                    {activeTab === 'height' && (
                      <Line type="monotone" dataKey="Height" name="Height (cm)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
                    )}
                    {activeTab === 'head' && (
                      <Line type="monotone" dataKey="Head Circ." name="Head (cm)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Measurements History logs column */}
          <div className="kido-glass-card p-6 max-h-[420px] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>History</h3>
            
            <div className="flex flex-col gap-3">
              {[...sortedMeasurements].reverse().map(m => (
                <div key={m.id} className="p-3.5 border border-slate-100 rounded-2xl flex justify-between items-start bg-slate-50/50 hover:bg-sky-50/50 transition-colors">
                  <div className="min-w-0">
                    <span className="text-xs text-slate-400 font-bold block mb-1">
                      {new Date(m.measurement_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex gap-3 text-xs text-slate-700 font-bold flex-wrap">
                      {m.weight && <span>⚖️ {m.weight} kg</span>}
                      {m.height && <span>📏 {m.height} cm</span>}
                      {m.head_circumference && <span>🧠 {m.head_circumference} cm</span>}
                    </div>
                    {m.notes && <p className="text-xs text-slate-400 italic mt-1.5 truncate">{m.notes}</p>}
                  </div>

                  <div className="flex gap-1.5 ml-2">
                    <button
                      onClick={() => {
                        setEditingMeasurement(m);
                        setShowAddForm(true);
                      }}
                      className="p-1 hover:bg-sky-100 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border-none bg-transparent"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this measurement log? This action is permanent.')) {
                          deleteMeasurement(m.id);
                        }
                      }}
                      className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer border-none bg-transparent"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </Layout>
  );
};

export default GrowthPage;
