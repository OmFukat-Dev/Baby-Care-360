import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { babyApi, vaccinationApi, checkupApi, polioApi } from '../services/api';
import { Baby, VaccinationRecord, Checkup, PolioRecord } from '../types';
import Layout from '../components/layout/Layout';
import { 
  ChevronLeft, 
  ShieldAlert, 
  Phone, 
  Clock
} from 'lucide-react';

type SubTab = 'profile' | 'vaccines' | 'checkups' | 'polio';

const BabyDetail: React.FC = () => {
  const { babyId } = useParams<{ babyId: string }>();
  const navigate = useNavigate();
  const [baby, setBaby] = useState<Baby | null>(null);
  const [activeTab, setActiveTab] = useState<SubTab>('profile');

  // Lists
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [checkups, setCheckups] = useState<Checkup[]>([]);
  const [polioRecords, setPolioRecords] = useState<PolioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!babyId) return;
    loadData();
  }, [babyId]);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      
      const babyRes = await babyApi.getById(Number(babyId));
      setBaby(babyRes.data.baby);

      const [vaccRes, checkRes, polioRes] = await Promise.all([
        vaccinationApi.getAll(Number(babyId)),
        checkupApi.getAll(Number(babyId)),
        polioApi.getAll(Number(babyId))
      ]);

      setVaccinations(vaccRes.data.vaccinations || []);
      setCheckups(checkRes.data.checkups || []);
      setPolioRecords(polioRes.data.records || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load baby details.');
    } finally {
      setLoading(false);
    }
  }

  // Calculate age dynamically
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

  // Filter checkups into upcoming vs past
  const groupedCheckups = useMemo(() => {
    const today = new Date();
    const upcoming: Checkup[] = [];
    const past: Checkup[] = [];
    
    checkups.forEach(c => {
      const apptDate = new Date(c.appointment_date);
      if (apptDate >= today) {
        upcoming.push(c);
      } else {
        past.push(c);
      }
    });

    return {
      upcoming: upcoming.sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()),
      past: past.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
    };
  }, [checkups]);

  // Total completed vaccines pct
  const vaccineProgress = useMemo(() => {
    const total = vaccinations.length;
    const completed = vaccinations.filter(v => v.status === 'completed').length;
    return {
      total,
      completed,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [vaccinations]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col gap-4 py-8">
          <div className="h-8 bg-slate-100 animate-pulse rounded w-1/4"></div>
          <div className="h-32 bg-slate-100 animate-pulse rounded-3xl"></div>
          <div className="h-64 bg-slate-100 animate-pulse rounded-3xl mt-6"></div>
        </div>
      </Layout>
    );
  }

  if (!baby) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800">Child profile not found</h2>
          <button onClick={() => navigate('/')} className="mt-4 px-5 py-2.5 bg-sky-500 text-white font-bold rounded-full">
            Back to Dashboard
          </button>
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
                🛡️ Preventive Care & Profile
              </span>
            </div>

            <h1 className="kido-page-hero-title">
              {baby.name}'s Child Care & Profile
            </h1>

            <p className="kido-page-hero-desc">
              Born {new Date(baby.date_of_birth).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} ({calculateAge(baby.date_of_birth)} old). Monitor immunization milestone progress, pediatrician visits, and campaign logs.
            </p>

            {/* Micro Stats Chips Row */}
            <div className="kido-page-hero-chips">
              <span className="kido-hero-chip">
                👶 {baby.gender ? baby.gender.toUpperCase() : 'Child'}
              </span>
              {baby.blood_group && (
                <span className="kido-hero-chip">
                  🩸 Blood: {baby.blood_group.toUpperCase()}
                </span>
              )}
              <span className="kido-hero-chip success">
                💉 {vaccineProgress.completed} of {vaccineProgress.total} Doses Done
              </span>
              <span className="kido-hero-chip">
                🩺 {checkups.length} Visits Logged
              </span>
            </div>
          </div>

          {/* Right Wobbly Frame Hero Visual */}
          <div className="kido-page-hero-media wobbly-frame">
            <img src="/baby-preventive.jpg" alt="Baby preventive care and checkups" />
          </div>
        </div>

        {/* Cloud Transition Divider at Bottom */}
        <div className="kido-cloud-container">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,224L48,229.3C96,235,192,245,288,234.7C384,224,480,192,576,192C672,192,768,224,864,229.3C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {error && <div className="error-banner mb-6" role="alert">{error}</div>}

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200/80 mb-8 gap-6 flex-wrap">
        {[
          { key: 'profile', label: '👤 Profile & Bio' },
          { key: 'vaccines', label: '💉 Vaccine Timeline' },
          { key: 'checkups', label: '🩺 Pediatric Visit Logs' },
          { key: 'polio', label: '🚼 Polio Campaigns' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as SubTab)}
            className={`pb-4 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer bg-transparent border-none ${activeTab === tab.key ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Profile & Bio Information */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* General Bio Details */}
          <div className="kido-glass-card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Biological Profile</h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-semibold">Gender</span>
                <span className="text-slate-800 font-bold capitalize">{baby.gender || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-semibold">Blood Group</span>
                <span className="text-slate-800 font-bold uppercase">{baby.blood_group || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-semibold">Birth Weight</span>
                <span className="text-slate-800 font-bold">{baby.birth_weight ? `${baby.birth_weight} kg` : '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-semibold">Birth Length</span>
                <span className="text-slate-800 font-bold">{baby.birth_length ? `${baby.birth_length} cm` : '—'}</span>
              </div>
            </div>
          </div>

          {/* Pediatric & Emergency details */}
          <div className="flex flex-col gap-6">
            {/* Health indicators / allergies */}
            <div className="kido-glass-card p-6">
              <div className="flex items-center gap-2 mb-4 text-rose-600">
                <ShieldAlert size={20} />
                <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Allergies & Alerts</h3>
              </div>
              
              <div className="bg-rose-50/70 p-4 border border-rose-100 rounded-2xl text-xs font-semibold text-rose-900">
                ⚠️ No severe allergies reported. Always consult your clinic before introducing common food allergens like peanuts, soy, or dairy.
              </div>
            </div>

            {/* Emergency pediatrician contacts */}
            <div className="kido-glass-card p-6">
              <div className="flex items-center gap-2 mb-4 text-emerald-600">
                <Phone size={18} />
                <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Pediatrician Contact</h3>
              </div>
              
              <div className="flex flex-col gap-3 font-semibold text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Care Clinic</span>
                  <span className="text-slate-800">Baby Care Central Hospital</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Doctor Helpline</span>
                  <span className="text-slate-800 font-bold text-sky-600">+208-555-0112</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Vaccination Journey vertical progress timeline */}
      {activeTab === 'vaccines' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Progress indicator card */}
            <div className="kido-glass-card p-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-slate-500 font-bold">Vaccination Journey Progress</span>
                <span className="text-sm font-extrabold text-sky-600">{vaccineProgress.completed} of {vaccineProgress.total} Doses</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-sky-500 transition-all duration-500 rounded-full" style={{ width: `${vaccineProgress.pct}%` }}></div>
              </div>
              <span className="text-xs text-slate-400 font-medium">{vaccineProgress.pct}% completed</span>
            </div>

            {/* Vertical timeline progress track */}
            <div className="kido-glass-card p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>Immunization Schedule</h3>

              {vaccinations.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl block mb-3">💉</span>
                  <p className="text-sm font-semibold text-slate-600">No vaccinations recorded</p>
                </div>
              ) : (
                <div className="flex flex-col relative pl-6 border-l-2 border-slate-100 ml-4 gap-6">
                  {vaccinations.map((v) => {
                    const isCompleted = v.status === 'completed';
                    return (
                      <div key={v.id} className="relative">
                        {/* Bullet point node */}
                        <div className={`absolute -left-[33px] w-5 h-5 rounded-full border-4 border-white flex items-center justify-center ${isCompleted ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-slate-300'}`}>
                        </div>

                        {/* Timeline item card details */}
                        <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 flex justify-between items-center flex-wrap gap-3 hover:bg-sky-50/40 transition-colors">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{v.vaccine_name}</h4>
                            <p className="text-xs text-slate-400 font-semibold mt-1">Dose Number: {v.dose_number || '1'}</p>
                            {isCompleted ? (
                              <p className="text-xs text-emerald-600 font-bold mt-2">
                                ✓ Completed {v.administered_date ? new Date(v.administered_date).toLocaleDateString() : ''}
                              </p>
                            ) : (
                              <p className="text-xs text-amber-600 font-semibold mt-2">
                                📅 Scheduled: {v.scheduled_date ? new Date(v.scheduled_date).toLocaleDateString() : ''}
                              </p>
                            )}
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-xxs font-bold uppercase tracking-wider ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {v.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          <div className="kido-glass-card p-6 h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Vaccine Information</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4">
              Regular immunization schedules safeguard babies against dangerous preventable health hazards.
            </p>
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-xs font-semibold text-emerald-900 flex gap-3">
              <span className="text-xl">💉</span>
              <div>
                <span className="font-bold block mb-1">Immunization advice</span>
                Consult your pediatrician if your baby missed a scheduled vaccination dose.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Pediatric Visits & Checkups */}
      {activeTab === 'checkups' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Upcoming Appointments Cards */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Upcoming Visits</h3>
              
              {groupedCheckups.upcoming.length === 0 ? (
                <div className="p-6 kido-glass-card text-center">
                  <p className="text-sm font-semibold text-slate-600">No upcoming pediatric appointments</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groupedCheckups.upcoming.map((c) => (
                    <div key={c.id} className="kido-glass-card p-5 hover-scale">
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-2.5 py-0.5 bg-sky-50 text-sky-600 rounded-full text-xxs font-bold uppercase tracking-wider">
                          {c.reason || 'Checkup'}
                        </span>
                        <Clock size={16} className="text-slate-400" />
                      </div>

                      <h4 className="font-bold text-slate-800 text-sm mb-1">{c.doctor_name || 'Dr. Pediatrician'}</h4>
                      {c.clinic && <p className="text-xs text-slate-400 font-semibold">{c.clinic}</p>}
                      
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                        <span>📅 {new Date(c.appointment_date).toLocaleDateString()}</span>
                        {c.follow_up_date && <span>Follow-up: {new Date(c.follow_up_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past History Timeline */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Past Appointment History</h3>
              
              {groupedCheckups.past.length === 0 ? (
                <div className="p-6 kido-glass-card text-center">
                  <p className="text-sm font-semibold text-slate-600">No past checkup history</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {groupedCheckups.past.map((c) => (
                    <div key={c.id} className="kido-glass-card p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{c.reason || 'Routine Checkup'}</h4>
                        <p className="text-xs text-slate-400 font-semibold mt-1">
                          Doctor: {c.doctor_name || 'Pediatrician'} &bull; Clinic: {c.clinic || 'Central Health'}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 font-bold">
                        📅 {new Date(c.appointment_date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="kido-glass-card p-6 h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Visit Reminders</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4">
              Keeping record timelines of pediatric assessments helps diagnose growth trends early.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Polio campaign logs */}
      {activeTab === 'polio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            <div className="kido-glass-card p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Polio Campaign Log</h3>

              {polioRecords.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl block mb-3">🚼</span>
                  <p className="text-sm font-semibold text-slate-600">No polio campaign records</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {polioRecords.map((p) => (
                    <div key={p.id} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center bg-slate-50/50 hover:bg-sky-50/40 transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Polio Oral Dose</h4>
                        <p className="text-xs text-slate-400 font-semibold mt-1">
                          Campaign: {p.campaign || 'Oral Polio campaign'} &bull; Site: {p.location || 'Local Clinic'}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 font-bold">
                        📅 {new Date(p.dose_date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="kido-glass-card p-6 h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Polio Campaign Guidelines</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4">
              Polio drops campaigns are scheduled periodically by public health bodies. Keep these tracked to protect your child.
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BabyDetail;
