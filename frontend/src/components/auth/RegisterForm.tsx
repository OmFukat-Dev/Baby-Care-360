import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../layout/Layout';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  // Navigate to dashboard when authentication is successful
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      await register(formData.firstName, formData.lastName, formData.email, formData.password);
    } catch (requestError: any) {
      setError(requestError.message || 'Registration failed. Please try again.');
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout>
      {/* Hero Banner Section with registration form */}
      <section className="kido-hero-banner">
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
            <span className="kido-hero-badge">Premium Baby Tracking & Logs</span>
            <h1 className="kido-hero-title">BabyCare360 Baby Tracking & Care</h1>
            <p className="kido-hero-desc">
              At BabyCare360, we support families with premium routines, developmental monitoring, physical growth charts, and nutrition tracking. Join our digital care family today!
            </p>
          </div>

          {/* Right Register Card */}
          <div className="kido-form-card">
            <h2>Create Account</h2>
            <p className="subtext">Start your family's private health logs today.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.2rem' }}>
                <div className="kido-form-group">
                  <label htmlFor="reg-firstName">First Name</label>
                  <input
                    id="reg-firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="kido-form-group">
                  <label htmlFor="reg-lastName">Last Name</label>
                  <input
                    id="reg-lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="kido-form-group">
                <label htmlFor="reg-email">Email Address</label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="kido-form-group">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="•••••••• (Min 8 chars)"
                  minLength={8}
                  required
                />
              </div>

              {error && <p className="error" role="alert" style={{ marginBottom: '1.25rem' }}>{error}</p>}

              <button type="submit" className="kido-btn kido-btn-secondary" disabled={isLoading}>
                {isLoading ? 'Please wait…' : 'Create Account'}
              </button>
            </form>

            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.92rem' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
            </p>
          </div>
        </div>

        {/* Cloud Transition Divider at Bottom */}
        <div className="kido-cloud-container">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,224L48,229.3C96,235,192,245,288,234.7C384,224,480,192,576,192C672,192,768,224,864,229.3C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Programs Section */}
      <section style={{ maxWidth: '1280px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="kido-badge" style={{ background: 'var(--pastel-sky)' }}>Our Programs</span>
          <h2 style={{ fontSize: '2.4rem', color: 'var(--text)', marginTop: '0.5rem' }}>Active Tracker Utilities</h2>
          <p style={{ color: 'var(--text-soft)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
            We provide specialized tracking modules to help monitor key stages of child growth and health.
          </p>
        </div>

        <div className="kido-program-grid">
          {/* Card 1 */}
          <div className="kido-card kido-program-card animated-card delay-1">
            <div className="kido-program-image-wrap wobbly-frame">
              <img src="/toddler-blocks.jpg" alt="Toddler tracking" />
            </div>
            <h3 className="kido-program-title">Toddler Tracker</h3>
            <span className="kido-program-tag">Age 1.5 - 3 Years</span>
            <p className="kido-program-desc">
              Physical growth, height, weight, and head circumference metrics tracked against timeline metrics.
            </p>
            <button className="kido-circle-btn" onClick={() => navigate('/login')}>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          {/* Card 2 */}
          <div className="kido-card kido-program-card animated-card delay-2">
            <div className="kido-program-image-wrap wobbly-frame-alt">
              <img src="/baby-sleeping.jpg" alt="Preschool tracking" />
            </div>
            <h3 className="kido-program-title">Preschool Vaccines</h3>
            <span className="kido-program-tag">Age 3 - 4.5 Years</span>
            <p className="kido-program-desc">
              Mandatory immunizations, polio campaigns, pediatric checkups, and record archives.
            </p>
            <button className="kido-circle-btn" onClick={() => navigate('/login')}>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          {/* Card 3 */}
          <div className="kido-card kido-program-card animated-card delay-3">
            <div className="kido-program-image-wrap wobbly-frame">
              <img src="/baby-nutrition.jpg" alt="Kindergarten tracking" />
            </div>
            <h3 className="kido-program-title">Kindergarten Meals</h3>
            <span className="kido-program-tag">Age 4.5 - 6 Years</span>
            <p className="kido-program-desc">
              Food introductions, complementary diets, daily meal planning, and allergy warnings.
            </p>
            <button className="kido-circle-btn" onClick={() => navigate('/login')}>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          {/* Card 4 */}
          <div className="kido-card kido-program-card animated-card delay-4">
            <div className="kido-program-image-wrap wobbly-frame-alt">
              <img src="/hero-kid.jpg" alt="Infant Care tracking" />
            </div>
            <h3 className="kido-program-title">Infant Care Records</h3>
            <span className="kido-program-tag">Age 0 - 1.5 Years</span>
            <p className="kido-program-desc">
              Developmental milestones observation, sleeping schedules, medicine logging, and alerts.
            </p>
            <button className="kido-circle-btn" onClick={() => navigate('/login')}>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={{ maxWidth: '1280px', margin: '6rem auto', padding: '0 1.5rem' }}>
        <div className="kido-about-grid">
          {/* Left images */}
          <div className="kido-about-images">
            <img src="/hero-kid.jpg" alt="Child playing" className="kido-about-main-img wobbly-frame" />
            <div className="kido-about-decor-moon"></div>
            <svg className="kido-about-decor-wave" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
              <path d="M0 10 Q 25 20, 50 10 T 100 10" />
            </svg>
            <div className="kido-about-decor-star"><i className="fa-solid fa-star"></i></div>
          </div>

          {/* Right text */}
          <div className="kido-about-content">
            <span className="kido-badge" style={{ alignSelf: 'flex-start', background: 'var(--pastel-peach)', color: 'var(--secondary)' }}>About BabyCare360</span>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--text)', margin: '0.5rem 0 1.5rem' }}>Healthy Routines & Growth Tracking</h2>
            <p style={{ color: 'var(--text-soft)', lineHeight: '1.7', fontSize: '1.05rem' }}>
              At BabyCare360, we believe that early childhood is a critical phase of physical development, nutrition shaping, and milestone creation. Our system is a complete digital log for baby tracking.
            </p>
            
            <ul className="kido-about-list">
              <li className="kido-about-list-item"><span className="kido-about-list-dot"></span> Tracking Physical Growth</li>
              <li className="kido-about-list-item"><span className="kido-about-list-dot"></span> Feeding & Nutrition Schedules</li>
              <li className="kido-about-list-item"><span className="kido-about-list-dot"></span> Vaccination & Immunization Logs</li>
              <li className="kido-about-list-item"><span className="kido-about-list-dot"></span> Milestones & Development Tracker</li>
            </ul>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button className="kido-btn kido-btn-secondary" style={{ width: 'auto', padding: '0.85rem 2rem' }} onClick={() => navigate('/login')}>Learn More</button>
              <img src="/pencil-cartoon.png" alt="Pencil sketch illustration" style={{ width: '130px', height: 'auto', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Waves section with grid cards */}
      <section className="kido-waves-bg-section">
        {/* Cloud Transition Divider at Top */}
        <div className="kido-cloud-container-top" style={{ position: 'absolute', top: 0, left: 0 }}>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: '100%', height: '50px' }}>
            <path d="M0,32L60,37.3C120,43,240,53,360,48C480,43,600,21,720,21C840,21,960,43,1080,48C1200,53,1320,43,1380,37.3L1440,32L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" fill="var(--bg)"></path>
          </svg>
        </div>

        <div style={{ textAlign: 'center', margin: '1rem auto 4rem', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '2.3rem', color: 'var(--text)' }}>Why Families Trust BabyCare360</h2>
          <p style={{ color: 'var(--text-soft)', marginTop: '0.5rem' }}>
            Helping parents establish healthy daily routines, view unified milestones, and safely archive health reports.
          </p>
        </div>

        <div className="kido-wave-grid">
          <div className="kido-wave-card">
            <div className="kido-wave-badge"><i className="fa-solid fa-child-baby"></i></div>
            <h3 style={{ marginTop: '1.5rem', marginBottom: '0.8rem' }}>Baby Profiles</h3>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.92rem', lineHeight: '1.5' }}>Manage birth stats, allergies, and pediatric contacts for multiple children.</p>
            <img src="/pencil-boat.png" alt="pencil boat sketch" style={{ maxHeight: '90px', objectFit: 'contain' }} />
          </div>

          <div className="kido-wave-card">
            <div className="kido-wave-badge"><i className="fa-solid fa-cubes"></i></div>
            <h3 style={{ marginTop: '1.5rem', marginBottom: '0.8rem' }}>Interactive Plans</h3>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.92rem', lineHeight: '1.5' }}>Track medicine schedules, sleep habits, and weekly meal guides.</p>
            <img src="/pencil-cartoon.png" alt="pencil cartoon sketch" style={{ maxHeight: '90px', objectFit: 'contain' }} />
          </div>

          <div className="kido-wave-card">
            <div className="kido-wave-badge"><i className="fa-solid fa-chart-line"></i></div>
            <h3 style={{ marginTop: '1.5rem', marginBottom: '0.8rem' }}>Growth Charts</h3>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.92rem', lineHeight: '1.5' }}>Monitor age-wise physical percentile changes in high-fidelity charts.</p>
            <img src="/train.png" alt="train sketch" style={{ maxHeight: '90px', objectFit: 'contain' }} />
          </div>

          <div className="kido-wave-card">
            <div className="kido-wave-badge"><i className="fa-solid fa-shield-heart"></i></div>
            <h3 style={{ marginTop: '1.5rem', marginBottom: '0.8rem' }}>Safe & Encrypted</h3>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.92rem', lineHeight: '1.5' }}>Secure uploads of prescriptions and immunization certificates.</p>
            <img src="/pencil-boat.png" alt="pencil boat sketch" style={{ maxHeight: '90px', objectFit: 'contain' }} />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RegisterForm;
