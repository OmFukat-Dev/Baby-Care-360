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
      {/* Top Navigation */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-bold text-sm bg-transparent border-none cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <header className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Growth Monitoring
          </h1>
          {baby && (
            <p className="text-slate-500 font-medium mt-1">
              👶 {baby.name} &bull; <span className="font-semibold text-sky-600">{calculateAge(baby.date_of_birth)}</span>
            </p>
          )}
        </div>

        <button
          onClick={() => {
            setEditingMeasurement(undefined);
            setShowAddForm(!showAddForm);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-all shadow-md shadow-sky-500/10 cursor-pointer text-sm"
        >
          <Plus size={16} />
          <span>Record Measurement</span>
        </button>
      </header>

      {error && <div className="error-banner mb-6">{error}</div>}

      {/* Profile metric cards summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Weight', value: latestMetric.weight, unit: 'kg', color: 'border-l-sky-500', bg: 'bg-sky-50/40' },
          { label: 'Height', value: latestMetric.height, unit: 'cm', color: 'border-l-emerald-500', bg: 'bg-emerald-50/40' },
          { label: 'Head Circumference', value: latestMetric.head, unit: 'cm', color: 'border-l-violet-500', bg: 'bg-violet-50/40' }
        ].map((card, idx) => (
          <div key={idx} className={`bg-white border border-slate-100 border-l-4 ${card.color} rounded-2xl p-5 shadow-sm`}>
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">{card.label}</span>
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
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm max-w-xl mb-8">
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
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-slate-100 rounded-3xl text-center shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-6">⚖️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No growth measurements yet</h2>
          <p className="text-slate-500 max-w-sm mb-6">
            Enter periodic weight, height, and head circumference parameters to monitor growth curves over time.
          </p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-all cursor-pointer text-sm"
          >
            Log First Measurement
          </button>
        </div>
      ) : (
        /* Charts and log tabs */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Trends Charts column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Growth Curves</h3>
                
                {/* Trend Tabs toggle */}
                <div className="flex border border-slate-100 rounded-full p-1 bg-slate-50/50">
                  {[
                    { key: 'weight', label: 'Weight' },
                    { key: 'height', label: 'Height' },
                    { key: 'head', label: 'Head' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeTab === tab.key ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}
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
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }} />
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
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm max-h-[420px] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>History</h3>
            
            <div className="flex flex-col gap-3">
              {[...sortedMeasurements].reverse().map(m => (
                <div key={m.id} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-start hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0">
                    <span className="text-xs text-slate-400 font-bold block mb-1">
                      {new Date(m.measurement_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex gap-3 text-xs text-slate-600 font-semibold flex-wrap">
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
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border-none bg-transparent"
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
