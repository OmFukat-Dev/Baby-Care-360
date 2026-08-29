import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';

interface NavigationProps {
  user: User | null;
}

const Navigation: React.FC<NavigationProps> = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleNavClick = (path: string) => {
    if (user) {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="kido-header">
      <div className="kido-header-container">
        {/* Logo Branding */}
        <a href="/" className="kido-logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <img src="/babycare360-logo.png" alt="BabyCare360 logo" />
          <div className="kido-logo-text">
            <span className="kido-logo-title">BabyCare360</span>
            <span className="kido-logo-subtitle">Baby Care & Tracking</span>
          </div>
        </a>

        {/* Navigation Menu */}
        <nav>
          <ul className={`kido-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <li>
              <span className={`kido-nav-link ${isActive('/')}`} onClick={() => handleNavClick('/')}>
                Home
              </span>
            </li>
            {user && (
              <>
                <li>
                  <span className={`kido-nav-link ${location.pathname.startsWith('/growth') ? 'active' : ''}`} onClick={() => handleNavClick(`/growth/${user.id || 1}`)}>
                    Growth
                  </span>
                </li>
                <li>
                  <span className={`kido-nav-link ${location.pathname.startsWith('/nutrition') ? 'active' : ''}`} onClick={() => handleNavClick(`/nutrition/${user.id || 1}`)}>
                    Nutrition
                  </span>
                </li>
                <li>
                  <span className={`kido-nav-link ${location.pathname.startsWith('/development') ? 'active' : ''}`} onClick={() => handleNavClick(`/development/${user.id || 1}`)}>
                    Development
                  </span>
                </li>
                <li>
                  <span className={`kido-nav-link ${location.pathname.startsWith('/health-records') ? 'active' : ''}`} onClick={() => handleNavClick(`/health-records/${user.id || 1}`)}>
                    Preventive Care
                  </span>
                </li>
                <li>
                  <span className={`kido-nav-link ${location.pathname.startsWith('/analytics') ? 'active' : ''}`} onClick={() => handleNavClick(`/analytics/${user.id || 1}`)}>
                    Analytics
                  </span>
                </li>
              </>
            )}
            {!user && (
              <>
                <li><span className="kido-nav-link" onClick={() => navigate('/login')}>Login</span></li>
                <li><span className="kido-nav-link" onClick={() => navigate('/register')}>Register</span></li>
              </>
            )}
          </ul>
        </nav>

        {/* Right Side Actions */}
        <div className="kido-header-actions">
          {/* Phone CTA */}
          <div className="kido-phone-cta">
            <div className="kido-phone-icon">
              <i className="fa-solid fa-phone"></i>
            </div>
            <div className="kido-phone-info">
              <span className="kido-phone-label">Call Us Now</span>
              <span className="kido-phone-number">+208-555-0112</span>
            </div>
          </div>

          {/* Wishlist/Cart Badges */}
          <div className="kido-action-badge">
            <i className="fa-regular fa-heart"></i>
            <span className="badge-count">0</span>
          </div>

          <div className="kido-action-badge kido-action-badge-coral">
            <i className="fa-solid fa-bag-shopping"></i>
            <span className="badge-count">0</span>
          </div>

          {/* Auth State Button */}
          {user && (
            <button 
              className="outline-button" 
              onClick={logout}
              style={{
                borderRadius: '999px',
                padding: '0.6rem 1.2rem',
                border: '1.5px solid var(--border)',
                background: 'white',
                color: 'var(--text)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: 'none'
              }}
            >
              Sign out
            </button>
          )}

          {/* Mobile hamburger menu */}
          <button 
            className="kido-hamburger" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
