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
  PlusCircle,
  ChevronDown,
  Sparkles,
  Scale,
  Ruler,
  Brain,
  ShieldCheck,
  ArrowUpRight
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

  // Baby mood state (persisted in localStorage per baby)
  const [babyMood, setBabyMood] = useState<string>('happy');
  const [showMoodPicker, setShowMoodPicker] = useState<boolean>(false);

  const moods: { [key: string]: { label: string; emoji: string } } = {
    happy: { label: 'Happy & Active', emoji: '😊' },
    content: { label: 'Full & Content', emoji: '🍼' },
    sleepy: { label: 'Sleeping Sweetly', emoji: '😴' },
    playful: { label: 'Curious & Playful', emoji: '🧸' },
    fussy: { label: 'Needs Extra Hugs', emoji: '🩺' }
  };

  const selectedBaby = babies[selectedBabyIndex];

  // Load greeting with icon based on current local time
  const { greeting, greetingIcon } = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: 'Good morning', greetingIcon: '☀️' };
    if (hour < 17) return { greeting: 'Good afternoon', greetingIcon: '🌤️' };
    return { greeting: 'Good evening', greetingIcon: '🌙' };
  }, []);

  useEffect(() => {
    loadBabies();
  }, []);

  useEffect(() => {
    if (selectedBaby) {
      loadBabyDashboardData(selectedBaby.id);
      const savedMood = localStorage.getItem(`baby_mood_${selectedBaby.id}`);
      if (savedMood && moods[savedMood]) {
        setBabyMood(savedMood);
      } else {
        setBabyMood('happy');
      }
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

  // Count checked daily items
  const checkedCount = useMemo(() => {
    if (!selectedBaby) return 0;
    const todayStr = new Date().toISOString().split('T')[0];
    return ['breakfast', 'lunch', 'snack', 'dinner', 'nap', 'medicine']
      .filter(item => checkedItems[`${todayStr}-${selectedBaby.id}-${item}`]).length;
  }, [selectedBaby, checkedItems]);

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

      {/* Hero Banner Section with Floating Shapes, Twinkles & Cloud Transition */}
      <section className="kido-page-hero">
        <div className="kido-floating-shapes">
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
        </div>

        {/* Floating Twinkles & Delight Accents */}
        <div className="kido-hero-twinkle kido-hero-twinkle-1">✨</div>
        <div className="kido-hero-twinkle kido-hero-twinkle-2">🎈</div>
        <div className="kido-hero-twinkle kido-hero-twinkle-3">✨</div>

        <div className="kido-page-hero-inner">
          <div className="kido-page-hero-content">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="kido-time-greeting">
                  <span>{greetingIcon}</span>
                  <span>{greeting}</span>
                </span>
                <span className="kido-hero-badge">
                  <Sparkles size={13} className="text-amber-300" />
                  <span>Smart Pediatric Care 360</span>
                </span>
              </div>

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
                ? `Monitor physical milestones, feeding intake, vaccinations, and pediatric routines for ${selectedBaby.name} in one comforting place.`
                : "Welcome to BabyCare360. Create your child's profile below to unlock customized developmental milestones and healthcare trackers."}
            </p>

            {/* Micro Stats Chips Row + Interactive Mood Capsule */}
            {selectedBaby && (
              <div className="kido-page-hero-chips">
                {/* Baby Mood Capsule */}
                <div className="kido-mood-capsule">
                  <button 
                    className="kido-mood-badge" 
                    onClick={() => setShowMoodPicker(!showMoodPicker)}
                    title="Tap to update baby's current mood"
                  >
                    <span>{moods[babyMood]?.emoji || '😊'}</span>
                    <span>{moods[babyMood]?.label || 'Happy & Active'}</span>
                    <ChevronDown size={13} className="text-slate-400" />
                  </button>
                  {showMoodPicker && (
                    <div className="kido-mood-dropdown">
                      {Object.entries(moods).map(([key, val]) => (
                        <button
                          key={key}
                          className={`kido-mood-option ${babyMood === key ? 'active' : ''}`}
                          onClick={() => {
                            setBabyMood(key);
                            setShowMoodPicker(false);
                            localStorage.setItem(`baby_mood_${selectedBaby.id}`, key);
                          }}
                        >
                          <span>{val.emoji}</span>
                          <span>{val.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

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
            
            {/* Baby Overview Profile Card with Pastel Stat Pods */}
            <div className="kido-glass-card p-6">
              {/* Header with Avatar & Details */}
              <div className="flex items-center justify-between gap-4 flex-wrap pb-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  {/* Photo frame with edit badge */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 text-white flex items-center justify-center text-3xl shadow-md border-2 border-white">
                      👶
                    </div>
                    <button 
                      className="absolute -bottom-1 -right-1 bg-white text-slate-700 p-1.5 rounded-full border border-slate-200 cursor-pointer hover:bg-sky-50 transition-colors shadow-sm" 
                      onClick={() => { setEditingBaby(selectedBaby); setShowProfileForm(true); }}
                      title="Edit baby profile"
                    >
                      <Edit size={12} className="text-sky-600" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Outfit, Plus Jakarta Sans' }}>{selectedBaby.name}</h3>
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-sky-50 border border-sky-100 rounded-full text-xs font-bold text-sky-700">
                        🎂 {calculateAge(selectedBaby.date_of_birth)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Born on {new Date(selectedBaby.date_of_birth).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} • {selectedBaby.gender === 'female' ? 'Girl 👧' : 'Boy 👦'}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/baby/${selectedBaby.id}`)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-sky-200"
                >
                  <span>Full Profile</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
              
              {/* Micro-Metric Pastel Stat Pods Grid */}
              <div className="kido-stat-pods-grid">
                {/* Weight Pod */}
                <div className="kido-stat-pod kido-stat-pod-sky">
                  <div className="pod-header-row">
                    <div className="pod-icon-pod">
                      <Scale size={20} />
                    </div>
                    <span className="pod-percentile-pill">
                      ● 50th %ile
                    </span>
                  </div>
                  <div>
                    <div className="pod-label">Weight</div>
                    <div className="pod-value">{stats.weight} <span className="text-sm font-bold text-slate-500">kg</span></div>
                    <div className="pod-subtext">Normal Weight</div>
                  </div>
                </div>

                {/* Height Pod */}
                <div className="kido-stat-pod kido-stat-pod-mint">
                  <div className="pod-header-row">
                    <div className="pod-icon-pod">
                      <Ruler size={20} />
                    </div>
                    <span className="pod-percentile-pill">
                      ● Optimal
                    </span>
                  </div>
                  <div>
                    <div className="pod-label">Height / Length</div>
                    <div className="pod-value">{stats.height} <span className="text-sm font-bold text-slate-500">cm</span></div>
                    <div className="pod-subtext">Steady Growth</div>
                  </div>
                </div>

                {/* Head Circ Pod */}
                <div className="kido-stat-pod kido-stat-pod-rose">
                  <div className="pod-header-row">
                    <div className="pod-icon-pod">
                      <Brain size={20} />
                    </div>
                    <span className="pod-percentile-pill">
                      ● Healthy
                    </span>
                  </div>
                  <div>
                    <div className="pod-label">Head Circ.</div>
                    <div className="pod-value">{measurements[0]?.head_circumference || selectedBaby.birth_head_circumference || '35.0'} <span className="text-sm font-bold text-slate-500">cm</span></div>
                    <div className="pod-subtext">Cranial Growth</div>
                  </div>
                </div>

                {/* Vaccines Pod */}
                <div className="kido-stat-pod kido-stat-pod-purple">
                  <div className="pod-header-row">
                    <div className="pod-icon-pod">
                      <ShieldCheck size={20} />
                    </div>
                    <span className="pod-percentile-pill">
                      ● {stats.completedPct}%
                    </span>
                  </div>
                  <div>
                    <div className="pod-label">Immunization</div>
                    <div className="pod-value">{stats.vaccines}</div>
                    <div className="pod-subtext">Doses Completed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Care Routine Checklist */}
            <div className="kido-glass-card p-6">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Outfit, Plus Jakarta Sans' }}>Today's Care Routine</h3>
                    <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
                      {checkedCount === 6 ? '🎉 All Complete!' : `${checkedCount} of 6 Completed`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Check off daily tasks as you care for {selectedBaby.name}</p>
                </div>
                <span className="text-xs font-extrabold text-sky-600 px-3.5 py-1.5 bg-sky-50 border border-sky-100 rounded-full">
                  {Math.round((checkedCount / 6) * 100)}% Today
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="checklist-progress-bar-wrap">
                <div 
                  className="checklist-progress-bar-fill" 
                  style={{ width: `${Math.round((checkedCount / 6) * 100)}%` }}
                ></div>
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
                    <div
                      key={item.key}
                      onClick={() => toggleCheck(item.key)}
                      className={`checklist-card-item ${isChecked ? 'completed' : ''}`}
                    >
                      <div className="flex items-center w-full">
                        <div className="checklist-custom-checkbox">
                          {isChecked && <CheckCircle size={15} className="text-white fill-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="checklist-task-title truncate">{item.label}</div>
                          <div className="checklist-task-time">{item.desc}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suggestions Widget Section */}
            {suggestions.length > 0 && (
              <div className="kido-glass-card p-6">
                <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="kido-hero-badge text-xs" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#047857' }}>
                        💡 Personalized Advice
                      </span>
                      <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Outfit, Plus Jakarta Sans' }}>Care Recommendations</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Pediatric insights curated specifically for {selectedBaby.name}'s age</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {suggestions.map((item, idx) => {
                    const cat = item.category || 'nutrition';
                    return (
                      <div 
                        key={idx} 
                        className={`kido-suggestion-pill-card category-${cat}`}
                        onClick={() => {
                          if (item.category === 'nutrition') navigate(`/nutrition/${selectedBaby.id}`);
                          else if (item.category === 'growth') navigate(`/growth/${selectedBaby.id}`);
                          else if (item.category === 'development') navigate(`/development/${selectedBaby.id}`);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="text-2xl">{item.icon}</div>
                          <span className="kido-sug-tag">
                            {cat === 'nutrition' && '🥗 Nutrition'}
                            {cat === 'sleep' && '🌙 Rest'}
                            {cat === 'vaccine' && '🩺 Health'}
                            {cat === 'milestone' && '🧸 Play'}
                            {!['nutrition', 'sleep', 'vaccine', 'milestone'].includes(cat) && '✨ Care'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed flex-grow">
                          {item.description || item.text}
                        </p>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
                          <span>Explore Details</span>
                          <ArrowUpRight size={14} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Growth Weight Plot Card with Custom Glassmorphic Tooltip */}
            {weightChartData.length > 1 && (
              <div className="kido-glass-card p-6">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Outfit, Plus Jakarta Sans' }}>Growth Weight Trend</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Recent physical weight measurements over time</p>
                  </div>
                  <button onClick={() => navigate(`/growth/${selectedBaby.id}`)} className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1">
                    <span>Full Growth Analytics</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>

                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <LineChart data={weightChartData}>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} width={30} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="recharts-custom-tooltip">
                                <div className="recharts-custom-tooltip-date">{label}</div>
                                <div className="recharts-custom-tooltip-value">
                                  <Scale size={14} />
                                  <span>{payload[0].value} kg</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Weight" 
                        stroke="#0ea5e9" 
                        strokeWidth={3.5} 
                        dot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: '#0ea5e9' }} 
                        activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 3, fill: '#0284c7' }}
                      />
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Outfit, Plus Jakarta Sans' }}>Upcoming Schedule</h3>
                    <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-xs font-bold rounded-full border border-sky-100">
                      {upcomingTimeline.length} Events
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Pediatric visits and due immunization doses</p>
                </div>
                <button 
                  onClick={() => navigate(`/health-records/${selectedBaby.id}`)}
                  className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                >
                  <span>All</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

              {upcomingTimeline.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="text-sm font-semibold text-slate-600">All routines current</p>
                  <p className="text-xs text-slate-400 mt-0.5">No immediate events scheduled</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {upcomingTimeline.map((item, idx) => {
                    const daysUntil = Math.ceil((new Date(item.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const countdownText = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : daysUntil > 1 ? `In ${daysUntil}d` : 'Past due';
                    const isUrgent = daysUntil <= 2;
                    return (
                      <div key={idx} className="flex gap-3.5 items-start p-3.5 bg-white/80 border border-slate-100 rounded-2xl hover:border-sky-200 hover:shadow-sm transition-all">
                        <div className="text-2xl mt-0.5">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span 
                              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: item.badgeColor, color: 'var(--text)' }}
                            >
                              {item.badgeText}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isUrgent ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                              {countdownText}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-800 truncate">{item.title}</h4>
                          <p className="text-xs text-slate-400 font-semibold mt-1">
                            📅 {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Record Tracking Completeness Indicators */}
            <div className="kido-glass-card p-6">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Outfit, Plus Jakarta Sans' }}>Record Completeness</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Coverage of your child's developmental records</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-sky-600">
                    {Math.round((completeness.vax + completeness.growth + completeness.nutrition + completeness.milestones) / 4)}%
                  </span>
                  <span className="text-xs text-slate-400 block font-medium">Overall</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { label: 'Vaccinations', value: completeness.vax, gradient: 'from-emerald-400 to-teal-500' },
                  { label: 'Growth Tracking', value: completeness.growth, gradient: 'from-sky-400 to-blue-500' },
                  { label: 'Nutrition Tracking', value: completeness.nutrition, gradient: 'from-amber-400 to-orange-500' },
                  { label: 'Milestones Completed', value: completeness.milestones, gradient: 'from-purple-400 to-indigo-500' },
                ].map(metric => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                      <span>{metric.label}</span>
                      <span>{metric.value}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${metric.gradient} transition-all duration-500 rounded-full`} 
                        style={{ width: `${metric.value}%` }}
                      ></div>
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
