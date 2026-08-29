import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { babyApi } from '../services/api';
import { Baby } from '../types';
import Layout from '../components/layout/Layout';
import BabyList from '../components/babies/BabyList';
import BabyForm from '../components/babies/BabyForm';

const serviceCards = [
  {
    title: 'Vaccination Calendar',
    description: 'Track upcoming doses, reminders, and milestones for every child in your family.',
    route: '/health-records',
    accent: 'teal',
    icon: '💉',
    image: '/baby-sleeping.jpg',
  },
  {
    title: 'Nutrition Requirements',
    description: 'Monitor feeding routines, meal plans, and food introductions with confidence.',
    route: '/nutrition',
    accent: 'peach',
    icon: '🥗',
    image: '/baby-nutrition.jpg',
  },
  {
    title: 'Growth Monitoring',
    description: 'Review height, weight, and developmental changes over time.',
    route: '/growth',
    accent: 'mint',
    icon: '📏',
    image: '/toddler-blocks.jpg',
  },
  {
    title: 'Development & Care',
    description: 'Support daily routines, sleep patterns, medicines, and skill development.',
    route: '/development',
    accent: 'lavender',
    icon: '🌟',
    image: '/hero-kid.jpg',
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [babies, setBabies] = useState<Baby[]>([]);
  const [editingBaby, setEditingBaby] = useState<Baby | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const suggestions = useMemo(() => {
    if (!babies.length) {
      return [
        { icon: '👶', title: 'Add your first baby profile', text: 'Start with a name, birth date, and care details to unlock personalized suggestions.' },
        { icon: '💡', title: 'Create a weekly routine', text: 'Set feeding, naps, and playtime habits to keep every day calm and consistent.' },
        { icon: '📅', title: 'Plan reminders', text: 'Add vaccination and checkup reminders so important milestones never get missed.' },
      ];
    }

    return [
      { icon: '💧', title: 'Hydration check', text: 'Keep an eye on feeds and fluids, especially during warmer days and active play.' },
      { icon: '🛌', title: 'Sleep routine', text: 'Review naps and bedtime patterns to maintain a calmer evening rhythm.' },
      { icon: '🌞', title: 'Development boost', text: 'Try a few minutes of tummy time or sensory play today to support growth and movement.' },
    ];
  }, [babies]);

  useEffect(() => {
    loadBabies();
  }, []);

  async function loadBabies() {
    try {
      setLoading(true);
      const response = await babyApi.getAll();
      setBabies(response.data.babies || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load baby profiles.');
    } finally {
      setLoading(false);
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
        setBabies((current) => [...current, response.data.baby]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save the baby profile.');
      throw err;
    }
  }

  async function removeBaby(id: number) {
    try {
      setError('');
      await babyApi.delete(id);
      setBabies((current) => current.filter((baby) => baby.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not remove the baby profile.');
    }
  }

  return (
    <Layout>
      {/* Hero Banner Section */}
      <section className="kido-hero-banner" style={{ margin: '1rem -1.5rem 3rem', padding: '3.5rem 1.5rem 6.5rem' }}>
        {/* Floating Background Shapes */}
        <div className="kido-floating-shapes">
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
        </div>
        <div className="kido-hero-inner">
          {/* Left copy */}
          <div>
            <span className="kido-hero-badge" style={{ background: 'rgba(255,255,255,0.2)' }}>Family Dashboard</span>
            <h2 className="kido-hero-title" style={{ fontSize: '2.8rem', margin: '0.2rem 0 1rem' }}>Welcome back, {user?.first_name || 'Parent'}</h2>
            <p className="kido-hero-desc" style={{ marginBottom: 0 }}>
              Easily manage vaccinations, polio schedules, daily feeding menus, sleeping habits, physical measurements, and health timeline reports in one secure place.
            </p>
          </div>

          {/* Right illustration / profile summary stats */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem' }}>👶</span>
            <h3 style={{ color: 'white', fontSize: '1.5rem', margin: '0.8rem 0 0.2rem' }}>{babies.length} Profile{babies.length === 1 ? '' : 's'}</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', margin: 0 }}>Registered in BabyCare360</p>
          </div>
        </div>

        {/* Cloud Transition Divider at Bottom */}
        <div className="kido-cloud-container">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,224L48,229.3C96,235,192,245,288,234.7C384,224,480,192,576,192C672,192,768,224,864,229.3C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {error && <p className="error" role="alert" style={{ marginBottom: '2rem' }}>{error}</p>}

      {/* Suggestions Section */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="kido-badge" style={{ background: 'var(--pastel-peach)', color: 'var(--secondary)' }}>Personalized Tips</span>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--text)', marginTop: '0.2rem' }}>Daily Care Suggestions</h3>
          </div>
          <span style={{ color: 'var(--text-soft)', fontSize: '0.95rem', fontWeight: 600 }}>Based on registered profiles</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="kido-program-grid">
          {suggestions.map((item, idx) => (
            <div key={item.title} className={`kido-card animated-card delay-${idx + 1}`} style={{ display: 'flex', gap: '1.25rem', padding: '1.5rem 1.8rem' }}>
              <div style={{ fontSize: '2.2rem', flexShrink: 0 }}>{item.icon}</div>
              <div>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--text)', marginBottom: '0.35rem' }}>{item.title}</h4>
                <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trackers Programs Section */}
      <section style={{ marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="kido-badge" style={{ background: 'var(--pastel-sky)' }}>Tracking Hub</span>
          <h2 style={{ fontSize: '2.3rem', color: 'var(--text)', marginTop: '0.5rem' }}>Essential Care Utilities</h2>
          <p style={{ color: 'var(--text-soft)', marginTop: '0.5rem' }}>Select a tracking area to log status details, view calendars, and update records.</p>
        </div>

        <div className="kido-program-grid">
          {serviceCards.map((card, idx) => (
            <div key={card.title} className={`kido-card kido-program-card animated-card delay-${idx + 1}`}>
              <div className={`kido-program-image-wrap ${idx % 2 === 0 ? 'wobbly-frame' : 'wobbly-frame-alt'}`}>
                <img src={card.image} alt={card.title} />
              </div>
              <h3 className="kido-program-title" style={{ fontSize: '1.3rem' }}>{card.title}</h3>
              <span className="kido-program-tag">{card.title.split(' ')[0]} Care</span>
              <p className="kido-program-desc" style={{ fontSize: '0.9rem', minHeight: '65px' }}>
                {card.description}
              </p>
              <button 
                type="button" 
                className="kido-circle-btn"
                onClick={() => {
                  const target = babies[0]?.id ? `/baby/${babies[0].id}` : '/';
                  if (card.route === '/growth') {
                    if (babies[0]) navigate(`/growth/${babies[0].id}`);
                    else navigate('/');
                    return;
                  }
                  if (card.route === '/nutrition') {
                    if (babies[0]) navigate(`/nutrition/${babies[0].id}`);
                    else navigate('/');
                    return;
                  }
                  if (card.route === '/development') {
                    if (babies[0]) navigate(`/development/${babies[0].id}`);
                    else navigate('/');
                    return;
                  }
                  if (card.route === '/health-records') {
                    if (babies[0]) navigate(`/health-records/${babies[0].id}`);
                    else navigate('/');
                    return;
                  }
                  navigate(target);
                }}
              >
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Baby List and Profile Management Section */}
      <section className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem', marginBottom: '4rem' }}>
        <BabyList
          babies={babies}
          loading={loading}
          onEdit={setEditingBaby}
          onDelete={removeBaby}
        />
        <BabyForm
          baby={editingBaby}
          onSubmit={saveBaby}
          onCancel={() => setEditingBaby(undefined)}
        />
      </section>
    </Layout>
  );
};

export default Dashboard;
