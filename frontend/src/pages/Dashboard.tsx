import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { babyApi, growthApi, vaccinationApi, checkupApi } from '../services/api';
import { Baby } from '../types';
import Layout from '../components/layout/Layout';
import BabyForm from '../components/babies/BabyForm';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  PlusCircle,
  ChevronDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [babies, setBabies] = useState<Baby[]>([]);
  const [selectedBabyIndex, setSelectedBabyIndex] = useState<number>(0);
  const [editingBaby, setEditingBaby] = useState<Baby | undefined>();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [error, setError] = useState('');

  // Loaded statistics & tracking records for selected baby
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [checkups, setCheckups] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showBabyDropdown, setShowBabyDropdown] = useState(false);

  // Today checklist items state
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const selectedBaby = babies[selectedBabyIndex];

  // Load greeting based on current local time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    loadBabies();
  }, []);

  useEffect(() => {
    if (selectedBaby) {
      loadBabyDashboardData(selectedBaby.id);
    }
  }, [selectedBaby]);

  async function loadBabies() {
    try {
      const response = await babyApi.getAll();
      const loaded = response.data.babies || [];
      setBabies(loaded);
      
      // Keep active baby ID cached in localStorage
      if (loaded.length > 0) {
        localStorage.setItem('active_baby_id', loaded[0].id.toString());
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load baby profiles.');
    }
  }

  async function loadBabyDashboardData(babyId: number) {
    try {
      // 1. Fetch growth measurements
      const growthRes = await growthApi.getAll(babyId);
      setMeasurements(growthRes.data.records || []);

      // 2. Fetch vaccinations
      const vaccineRes = await vaccinationApi.getAll(babyId);
      setVaccinations(vaccineRes.data.vaccinations || []);

      // 3. Fetch pediatric checkups
      const checkupRes = await checkupApi.getAll(babyId);
      setCheckups(checkupRes.data.checkups || []);

      // 4. Fetch dynamic suggestions
      const suggestionsRes = await babyApi.getSuggestions(babyId);
      setSuggestions((suggestionsRes.data.suggestions || []).slice(0, 3));

      // 5. Hydrate today checklist local storage
      const todayStr = new Date().toISOString().split('T')[0];
      const items = ['breakfast', 'lunch', 'snack', 'dinner', 'nap', 'medicine'];
      const loadedChecks: { [key: string]: boolean } = {};
      items.forEach(item => {
        const key = `${todayStr}-${babyId}-${item}`;
        loadedChecks[key] = localStorage.getItem(key) === 'true';
      });
      setCheckedItems(loadedChecks);

    } catch (err) {
      console.error('Error fetching dashboard records:', err);
    }
  }

  async function saveBaby(data: Partial<Baby>) {
    try {
      setError('');
      if (editingBaby) {
        const response = await babyApi.update(editingBaby.id, data);
        setBabies((current) =>
          current.map((baby) =>
            baby.id === editingBaby.id ? response.data.baby : baby
          )
        );
        setEditingBaby(undefined);
      } else {
        const response = await babyApi.create(data);
        const newBaby = response.data.baby;
        setBabies((current) => [...current, newBaby]);
        setSelectedBabyIndex(babies.length);
        localStorage.setItem('active_baby_id', newBaby.id.toString());
      }
      setShowProfileForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save the baby profile.');
      throw err;
    }
  }

  async function removeBaby(id: number) {
    try {
      setError('');
      await babyApi.delete(id);
      const remaining = babies.filter((b) => b.id !== id);
      setBabies(remaining);
      setSelectedBabyIndex(0);
      if (remaining.length > 0) {
        localStorage.setItem('active_baby_id', remaining[0].id.toString());
      } else {
        localStorage.removeItem('active_baby_id');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not remove the baby profile.');
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
    if (totalMonths === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    if (days === 0) {
      return `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
    }
    return `${totalMonths} month${totalMonths !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''}`;
  }

  // Toggle checklist item
  const toggleCheck = (item: string) => {
    if (!selectedBaby) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const key = `${todayStr}-${selectedBaby.id}-${item}`;
    const newVal = !checkedItems[key];
    setCheckedItems(prev => ({ ...prev, [key]: newVal }));
    localStorage.setItem(key, newVal ? 'true' : 'false');
  };

  // Compute stats for active baby
  const stats = useMemo(() => {
    if (!selectedBaby) return { weight: '--', height: '--', vaccines: '0/0', completedPct: 0 };
    
    const latestWeight = measurements[0]?.weight || selectedBaby.birth_weight || '--';
    const latestHeight = measurements[0]?.height || selectedBaby.birth_length || '--';
    
    const totalVax = vaccinations.length;
    const completedVax = vaccinations.filter(v => v.status === 'completed').length;
    
    return {
      weight: latestWeight,
      height: latestHeight,
      vaccines: `${completedVax} / ${totalVax}`,
      completedPct: totalVax > 0 ? Math.round((completedVax / totalVax) * 100) : 0
    };
  }, [selectedBaby, measurements, vaccinations]);

  // Compute tracking completeness values
  const completeness = useMemo(() => {
    if (!selectedBaby) return { vax: 0, growth: 0, nutrition: 0, milestones: 0 };
    
    // Growth completeness based on count of measurements
    const growthVal = Math.min(100, measurements.length * 20);
    // Nutrition logs tracking completeness
    const totalChecks = 6;
    const todayStr = new Date().toISOString().split('T')[0];
    const loggedChecksCount = ['breakfast', 'lunch', 'snack', 'dinner', 'nap', 'medicine']
      .filter(item => checkedItems[`${todayStr}-${selectedBaby.id}-${item}`]).length;
    const nutritionVal = Math.round((loggedChecksCount / totalChecks) * 100);

    // Milestones tracking completeness mock
    const milestonesVal = 85;

    return {
      vax: stats.completedPct,
      growth: growthVal > 0 ? growthVal : 20,
      nutrition: nutritionVal > 0 ? nutritionVal : 10,
      milestones: milestonesVal
    };
  }, [selectedBaby, measurements, checkedItems, stats.completedPct]);

  // Upcoming items timeline list
  const upcomingTimeline = useMemo(() => {
    const list: any[] = [];
    
    // 1. Pending vaccines
    vaccinations
      .filter(v => v.status === 'pending')
      .slice(0, 2)
      .forEach(v => {
        list.push({
          type: 'vaccine',
          title: v.vaccine_name,
          date: v.scheduled_date,
          icon: '💉',
          badgeColor: 'var(--pastel-peach)',
          badgeText: 'Pending Dose'
        });
      });

    // 2. Upcoming checkups
    checkups
      .filter(c => new Date(c.checkup_date) >= new Date())
      .slice(0, 2)
      .forEach(c => {
        list.push({
          type: 'checkup',
          title: `Checkup: ${c.clinic_name || 'Pediatrician'}`,
          date: c.checkup_date,
          icon: '🩺',
          badgeColor: 'var(--pastel-sky)',
          badgeText: 'Pediatric Visit'
        });
      });

    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [vaccinations, checkups]);

  // Formatted compact weight line data
  const weightChartData = useMemo(() => {
    return measurements
      .slice(0, 5)
      .map(m => ({
        date: new Date(m.measurement_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Weight: m.weight
      }))
      .reverse();
  }, [measurements]);

  return (
    <Layout>
      {error && <div className="error-banner mb-6" role="alert">{error}</div>}

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
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <span className="kido-hero-badge">
                ✨ Smart Pediatric Care Dashboard
              </span>

              {/* Baby Profile Switcher Dropdown */}
              {babies.length > 0 && (
                <div className="relative">
                  <button 
                    onClick={() => setShowBabyDropdown(!showBabyDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-white font-bold text-sm transition-all cursor-pointer shadow-sm"
                  >
                    <span>👶</span>
                    <span>{selectedBaby?.name}</span>
                    <ChevronDown size={16} className="text-white/80" />
                  </button>

                  {showBabyDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-2 animate-fade-in text-slate-800">
                      {babies.map((baby, idx) => (
                        <button
                          key={baby.id}
                          onClick={() => {
                            setSelectedBabyIndex(idx);
                            localStorage.setItem('active_baby_id', baby.id.toString());
                            setShowBabyDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold hover:bg-sky-50 transition-colors ${idx === selectedBabyIndex ? 'text-sky-600 bg-sky-50/70 font-bold' : 'text-slate-700'}`}
                        >
                          <span>👶</span>
                          <span className="flex-1 truncate">{baby.name}</span>
                        </button>
                      ))}
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={() => {
                          setEditingBaby(undefined);
                          setShowProfileForm(true);
                          setShowBabyDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-sky-600 hover:bg-sky-50 transition-colors"
                      >
                        <PlusCircle size={18} />
                        <span>Add another profile</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <h1 className="kido-page-hero-title">
              {greeting}, {user?.first_name || 'Parent'} & {selectedBaby ? selectedBaby.name : 'Baby'}! 👋
            </h1>

            <p className="kido-page-hero-desc">
              {selectedBaby 
                ? `Monitor physical milestones, feeding intake, vaccinations, and pediatric routines for ${selectedBaby.name} in one place.`
                : "Welcome to BabyCare360. Create your child's profile below to unlock customized developmental milestones and healthcare trackers."}
            </p>

            {/* Micro Stats Chips Row */}
            {selectedBaby && (
              <div className="kido-page-hero-chips">
                <span className="kido-hero-chip">
                  🎂 {calculateAge(selectedBaby.date_of_birth)}
                </span>
                <span className="kido-hero-chip">
                  ⚖️ {stats.weight} kg
                </span>
                <span className="kido-hero-chip">
                  📏 {stats.height} cm
                </span>
                <span className="kido-hero-chip success">
                  💉 {stats.vaccines} Vaccines Done
                </span>
              </div>
            )}
          </div>

          {/* Right Wobbly Frame Hero Visual */}
          <div className="kido-page-hero-media wobbly-frame">
            <img src="/hero-kid.jpg" alt="Child tracking dashboard" />
          </div>
        </div>

        {/* Cloud Transition Divider at Bottom */}
        <div className="kido-cloud-container">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,224L48,229.3C96,235,192,245,288,234.7C384,224,480,192,576,192C672,192,768,224,864,229.3C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Main Dashboard Layout */}
      {!selectedBaby ? (
        /* Empty Dashboard State */
        <div className="kido-glass-card flex flex-col items-center justify-center py-16 px-6 text-center max-w-2xl mx-auto my-8">
          <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">🧸</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No profiles registered yet</h2>
          <p className="text-slate-500 max-w-md mb-8">
            Create your child's profile to unlock immunization timelines, growth statistics, meal trackers, and personalized pediatrician suggestions.
          </p>
          <button 
            onClick={() => setShowProfileForm(true)} 
            className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-all cursor-pointer shadow-lg shadow-sky-500/25"
          >
            <Plus size={18} />
            <span>Create Baby Profile</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns (Larger: Profile, Today, Growth, Suggestions) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Baby Overview Profile Card */}
            <div className="kido-glass-card p-6 flex items-center gap-6 flex-wrap md:flex-nowrap">
              {/* Photo frame */}
              <div className="kido-avatar-circle flex-shrink-0 w-24 h-24 bg-sky-50 text-slate-700 flex items-center justify-center text-4xl border-2 border-sky-200 relative shadow-sm">
                👶
                <div 
                  className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-1.5 rounded-full border-2 border-white cursor-pointer hover:bg-sky-600 transition-colors shadow-sm" 
                  onClick={() => { setEditingBaby(selectedBaby); setShowProfileForm(true); }}
                  title="Edit baby profile"
                >
                  <Edit size={13} />
                </div>
              </div>

              {/* Bio & Parameters */}
              <div className="flex-grow">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>{selectedBaby.name}</h3>
                  <span className="inline-block px-3 py-1 bg-sky-50 border border-sky-100 rounded-full text-xs font-bold text-sky-700">
                    {calculateAge(selectedBaby.date_of_birth)}
                  </span>
                </div>
                
                {/* Micro parameters grid */}
                <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Weight</span>
                    <span className="text-xl font-extrabold text-slate-800">{stats.weight} <span className="text-sm font-semibold text-slate-400">kg</span></span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Height</span>
                    <span className="text-xl font-extrabold text-slate-800">{stats.height} <span className="text-sm font-semibold text-slate-400">cm</span></span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Immunization</span>
                    <span className="text-xl font-extrabold text-slate-800">{stats.vaccines} <span className="text-sm font-semibold text-slate-400">doses</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Care Checklist */}
            <div className="kido-glass-card p-6">
              <div className="mb-6 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Today's Care</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Check completed activities to maintain a consistent daily routine</p>
                </div>
                <span className="text-xs font-bold text-sky-700 px-3.5 py-1.5 bg-sky-50 border border-sky-100 rounded-full">
                  {['breakfast', 'lunch', 'snack', 'dinner', 'nap', 'medicine'].filter(item => checkedItems[`${new Date().toISOString().split('T')[0]}-${selectedBaby.id}-${item}`]).length} / 6 Tracked
                </span>
              </div>

              {/* Grid checklists */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'breakfast', label: '🌅 Breakfast', desc: 'First feeding / Milk' },
                  { key: 'lunch', label: '☀️ Lunch', desc: 'Purees / Solid food' },
                  { key: 'snack', label: '🍎 Snack', desc: 'Fruit / Soft snacks' },
                  { key: 'dinner', label: '🌙 Dinner', desc: 'Evening feeding' },
                  { key: 'nap', label: '🛌 Nap Time', desc: 'Day rest schedule' },
                  { key: 'medicine', label: '💊 Medicine', desc: 'Prescribed dosage' },
                ].map(item => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const itemKey = `${todayStr}-${selectedBaby.id}-${item.key}`;
                  const isChecked = !!checkedItems[itemKey];
                  return (
                    <button
                      key={item.key}
                      onClick={() => toggleCheck(item.key)}
                      className={`flex flex-col items-start p-3.5 border rounded-2xl text-left cursor-pointer transition-all hover-scale ${isChecked ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-sm' : 'bg-slate-50/60 border-slate-100 text-slate-800 hover:bg-sky-50/50 hover:border-sky-200'}`}
                    >
                      <div className="flex items-center gap-2 w-full justify-between">
                        <span className="font-bold text-sm">{item.label}</span>
                        <CheckCircle size={17} className={isChecked ? 'text-emerald-500 fill-emerald-500/20' : 'text-slate-300'} />
                      </div>
                      <span className="text-xs text-slate-400 font-medium mt-1">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Suggestions Widget Section */}
            {suggestions.length > 0 && (
              <div className="kido-glass-card p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <span className="kido-badge" style={{ background: 'var(--pastel-mint)', color: 'var(--success)' }}>Personalized</span>
                    <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Suggested for {selectedBaby.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Recommendations tailored to child's age group and current progress</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {suggestions.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 border border-slate-100 rounded-2xl flex flex-col items-start bg-white/70 shadow-sm hover-scale cursor-pointer transition-all hover:border-sky-200"
                      style={{ animationDelay: `${idx * 0.4}s` }}
                      onClick={() => {
                        if (item.category === 'nutrition') navigate(`/nutrition/${selectedBaby.id}`);
                        else if (item.category === 'growth') navigate(`/growth/${selectedBaby.id}`);
                        else if (item.category === 'development') navigate(`/development/${selectedBaby.id}`);
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-xl mb-3 shadow-sm">{item.icon}</div>
                      <h4 className="font-bold text-sm text-slate-800 mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed flex-grow">
                        {item.description || item.text}
                      </p>
                      <span className="mt-3 text-xs font-bold text-sky-600 hover:underline">Explore →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Growth Weight Plot Card */}
            {weightChartData.length > 1 && (
              <div className="kido-glass-card p-6">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Growth Weight Trend</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Recent physical weight measurements over time</p>
                  </div>
                  <button onClick={() => navigate(`/growth/${selectedBaby.id}`)} className="text-xs font-bold text-sky-600 hover:underline">
                    View Full Growth →
                  </button>
                </div>

                <div style={{ width: '100%', height: 170 }}>
                  <ResponsiveContainer>
                    <LineChart data={weightChartData}>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} width={30} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ borderRadius: '14px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }} />
                      <Line type="monotone" dataKey="Weight" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </div>

          {/* Right Columns (Upcoming, Completeness Metrics) */}
          <div className="flex flex-col gap-8">
            
            {/* Upcoming Pediatric Routine & Dose Card */}
            <div className="kido-glass-card p-6">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Upcoming Schedule</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Pediatric visits and due dose schedules</p>
                </div>
                <Clock size={18} className="text-slate-400" />
              </div>

              {upcomingTimeline.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="text-sm font-semibold text-slate-600">All routines current</p>
                  <p className="text-xs text-slate-400 mt-0.5">No immediate events scheduled</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {upcomingTimeline.map((item, idx) => (
                    <div key={idx} className="flex gap-3.5 items-start p-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl hover:border-sky-200 transition-colors">
                      <div className="text-2xl mt-0.5">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <span 
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-1.5"
                          style={{ background: item.badgeColor, color: 'var(--text)' }}
                        >
                          {item.badgeText}
                        </span>
                        <h4 className="font-bold text-sm text-slate-800 truncate">{item.title}</h4>
                        <p className="text-xs text-slate-400 font-semibold mt-1">
                          📅 {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Record Tracking Completeness Indicators */}
            <div className="kido-glass-card p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Record Completeness</h3>
                <p className="text-xs text-slate-400 mt-0.5">Coverage of your child's developmental records</p>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { label: 'Vaccinations', value: completeness.vax, color: 'bg-emerald-500' },
                  { label: 'Growth Tracking', value: completeness.growth, color: 'bg-sky-500' },
                  { label: 'Nutrition Tracking', value: completeness.nutrition, color: 'bg-amber-500' },
                  { label: 'Milestones Completed', value: completeness.milestones, color: 'bg-violet-500' },
                ].map(metric => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                      <span>{metric.label}</span>
                      <span>{metric.value}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className={`h-full ${metric.color} transition-all duration-500 rounded-full`} style={{ width: `${metric.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Accordion Toggle Panel for baby list & forms */}
      <section className="mt-12 border-t border-slate-200/60 pt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Child Profiles Directory</h3>
            <p className="text-xs text-slate-400 mt-0.5">Manage and configure all registered children</p>
          </div>
          <button
            onClick={() => {
              setEditingBaby(undefined);
              setShowProfileForm(!showProfileForm);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-full font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all shadow-sm cursor-pointer hover-scale"
          >
            {showProfileForm ? 'Cancel Form' : 'Add New Child +'}
          </button>
        </div>

        {/* Modal / Inline form view */}
        {showProfileForm && (
          <div className="kido-glass-card p-6 max-w-xl mb-8">
            <h4 className="text-base font-bold text-slate-800 mb-4">{editingBaby ? 'Edit Baby Profile' : 'New Baby Registration'}</h4>
            <BabyForm
              baby={editingBaby}
              onSubmit={saveBaby}
              onCancel={() => setShowProfileForm(false)}
            />
          </div>
        )}

        {/* Profiles Table / Listing */}
        {babies.length > 0 && (
          <div className="kido-glass-card p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3 pl-2">Name</th>
                    <th className="pb-3">Date of Birth</th>
                    <th className="pb-3">Gender</th>
                    <th className="pb-3 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {babies.map((baby) => (
                    <tr key={baby.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 pl-2 font-bold text-slate-800">{baby.name}</td>
                      <td className="py-3.5 text-slate-500">{new Date(baby.date_of_birth).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td className="py-3.5 text-slate-500 capitalize">{baby.gender}</td>
                      <td className="py-3.5 pr-2 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setEditingBaby(baby);
                              setShowProfileForm(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to permanently delete the profile for ${baby.name}?`)) {
                                removeBaby(baby.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Dashboard;
