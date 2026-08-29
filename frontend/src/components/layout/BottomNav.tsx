import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Apple, 
  TrendingUp, 
  ShieldCheck, 
  Menu,
  Brain,
  BarChart2,
  LogOut,
  X
} from 'lucide-react';

interface BottomNavProps {
  currentBabyId?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentBabyId }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' ? 'active' : '';
    }
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const handleNav = (path: string) => {
    setShowMoreMenu(false);
    if (currentBabyId) {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <div className="kido-bottom-nav">
        <button 
          onClick={() => navigate('/')} 
          className={`bottom-nav-item ${isActive('/')}`}
        >
          <Home size={20} />
          <span className="bottom-nav-label">Home</span>
        </button>

        <button 
          onClick={() => handleNav(`/nutrition/${currentBabyId}`)} 
          className={`bottom-nav-item ${isActive('/nutrition')}`}
        >
          <Apple size={20} />
          <span className="bottom-nav-label">Nutrition</span>
        </button>

        <button 
          onClick={() => handleNav(`/growth/${currentBabyId}`)} 
          className={`bottom-nav-item ${isActive('/growth')}`}
        >
          <TrendingUp size={20} />
          <span className="bottom-nav-label">Growth</span>
        </button>

        <button 
          onClick={() => handleNav(`/health-records/${currentBabyId}`)} 
          className={`bottom-nav-item ${isActive('/health-records')}`}
        >
          <ShieldCheck size={20} />
          <span className="bottom-nav-label">Health</span>
        </button>

        <button 
          onClick={() => setShowMoreMenu(true)} 
          className={`bottom-nav-item ${showMoreMenu ? 'active' : ''}`}
        >
          <Menu size={20} />
          <span className="bottom-nav-label">More</span>
        </button>
      </div>

      {/* Slide-Up Bottom Overlay for "More" secondary items */}
      {showMoreMenu && (
        <div className="bottom-nav-overlay" onClick={() => setShowMoreMenu(false)}>
          <div className="bottom-nav-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>More Categories</h3>
              <button className="close-sheet-btn" onClick={() => setShowMoreMenu(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="sheet-content">
              <button 
                onClick={() => handleNav(`/development/${currentBabyId}`)}
                className="sheet-item-link"
              >
                <Brain size={20} className="sheet-icon-lavender" />
                <span>Milestones & Development</span>
              </button>
              
              <button 
                onClick={() => handleNav(`/analytics/${currentBabyId}`)}
                className="sheet-item-link"
              >
                <BarChart2 size={20} className="sheet-icon-blue" />
                <span>Health Reports & Analytics</span>
              </button>
              
              {user && (
                <button 
                  onClick={() => {
                    setShowMoreMenu(false);
                    logout();
                  }}
                  className="sheet-item-link sheet-item-logout"
                >
                  <LogOut size={20} />
                  <span>Sign out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNav;
