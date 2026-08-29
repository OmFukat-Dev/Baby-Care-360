import React, { useState } from 'react';
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
  User as UserIcon
} from 'lucide-react';

interface SidebarProps {
  currentBabyId?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentBabyId }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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
