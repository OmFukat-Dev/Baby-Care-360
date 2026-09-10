import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  TrendingUp, 
  Apple, 
  Brain, 
  ShieldCheck, 
  BarChart2, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  User as UserIcon,
  Moon,
  Sun,
  Music
} from 'lucide-react';

interface SidebarProps {
  currentBabyId?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentBabyId }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Night mode and White noise audio states
  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    return document.body.classList.contains('night-mode') || localStorage.getItem('babycare_theme') === 'night';
  });
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    const handleAudioStatus = (e: any) => {
      setIsPlayingAudio(!!e.detail?.isPlaying);
    };
    const handleNightToggle = () => {
      setIsNightMode(document.body.classList.contains('night-mode'));
    };
    window.addEventListener('whitenoise-status', handleAudioStatus);
    window.addEventListener('babycare-toggle-nightmode', handleNightToggle);
    return () => {
      window.removeEventListener('whitenoise-status', handleAudioStatus);
      window.removeEventListener('babycare-toggle-nightmode', handleNightToggle);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' ? 'active' : '';
    }
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const navItems = [
    {
      label: 'Dashboard',
      icon: Home,
      path: '/',
    },
    {
      label: 'Growth',
      icon: TrendingUp,
      path: currentBabyId ? `/growth/${currentBabyId}` : '/login',
    },
    {
      label: 'Nutrition',
      icon: Apple,
      path: currentBabyId ? `/nutrition/${currentBabyId}` : '/login',
    },
    {
      label: 'Development',
      icon: Brain,
      path: currentBabyId ? `/development/${currentBabyId}` : '/login',
    },
    {
      label: 'Preventive Care',
      icon: ShieldCheck,
      path: currentBabyId ? `/health-records/${currentBabyId}` : '/login',
    },
    {
      label: 'Analytics',
      icon: BarChart2,
      path: currentBabyId ? `/analytics/${currentBabyId}` : '/login',
    },
  ];

  return (
    <aside className={`kido-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-logo" onClick={() => navigate('/')}>
            <img src="/babycare360-logo.png" alt="BabyCare360" />
            <span className="sidebar-logo-text">BabyCare360</span>
          </div>
        )}
        <button 
          className="sidebar-toggle" 
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => {
            const Icon = item.icon;
            const activeClass = isActive(item.path);
            return (
              <li key={item.label}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`sidebar-nav-link ${activeClass}`}
                  title={item.label}
                >
                  <Icon size={20} className="nav-icon" />
                  {!collapsed && <span className="nav-label">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Sound & Theme Controls */}
      <div className="sidebar-tools-container" style={{ padding: collapsed ? '0.5rem' : '0.5rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid rgba(226, 232, 240, 0.6)' }}>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('babycare-open-whitenoise'))}
          className={`sidebar-nav-link ${isPlayingAudio ? 'active' : ''}`}
          style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}
          title="Soothing Sound Machine"
        >
          <Music size={18} className={isPlayingAudio ? 'text-emerald-500' : 'nav-icon'} />
          {!collapsed && (
            <span className="nav-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>Lullabies</span>
              {isPlayingAudio && <span style={{ fontSize: '0.65rem', background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: '10px' }}>Playing</span>}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('babycare-toggle-nightmode'));
            setIsNightMode(!isNightMode);
          }}
          className="sidebar-nav-link"
          style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}
          title={isNightMode ? 'Switch to Daylight Mode' : 'Switch to Soft Night-Care Mode'}
        >
          {isNightMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-400" />}
          {!collapsed && (
            <span className="nav-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>{isNightMode ? 'Night Care' : 'Daylight'}</span>
              <span style={{ fontSize: '0.65rem', background: isNightMode ? '#334155' : '#e0f2fe', color: isNightMode ? '#38bdf8' : '#0369a1', padding: '1px 6px', borderRadius: '10px' }}>
                {isNightMode ? 'Dark' : 'Soft'}
              </span>
            </span>
          )}
        </button>
      </div>

      {/* Sidebar Footer / User Profile */}
      {user && (
        <div className="sidebar-footer">
          {!collapsed ? (
            <div className="user-profile-summary">
              <div className="avatar-icon-circle">
                <UserIcon size={18} />
              </div>
              <div className="user-info-text">
                <span className="user-name-title">{user.first_name}</span>
                <span className="user-role-label">Parent</span>
              </div>
              <button 
                onClick={logout} 
                className="logout-icon-button"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={logout} 
              className="sidebar-nav-link logout-collapsed"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
