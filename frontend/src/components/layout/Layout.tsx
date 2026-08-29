import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="layout">
      {/* Sticky Topbar */}
      <div className="kido-topbar">
        <div className="kido-topbar-info">
          <span><i className="fa-solid fa-phone"></i> (+48) 254 76243</span>
          <span><i className="fa-solid fa-envelope"></i> info@Kiddly.com</span>
          <span><i className="fa-solid fa-clock"></i> Work Time: Mon - Fri 09AM - 6PM</span>
        </div>
        <div className="kido-topbar-social">
          <span>Follow Us On:</span>
          <a href="#facebook" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
          <a href="#twitter" aria-label="Twitter"><i className="fa-brands fa-twitter"></i></a>
          <a href="#instagram" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
          <a href="#behance" aria-label="Behance"><i className="fa-brands fa-behance"></i></a>
          <a href="#youtube" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <Navigation user={user} />

      {/* Main Page Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Floating Scroll Top Button */}
      {showScrollTop && (
        <button className="kido-scroll-top" onClick={scrollToTop} aria-label="Scroll to top">
          <i className="fa-solid fa-arrow-up"></i>
        </button>
      )}

      {/* Redesigned BabyCare360 Footer */}
      <footer className="kido-footer">
        <div className="kido-footer-container">
          <div className="kido-footer-brand">
            <a href="/" className="kido-footer-logo">
              <img src="/babycare360-logo.png" alt="BabyCare360 logo" />
              <span>BabyCare360</span>
            </a>
            <p className="kido-footer-desc">
              At BabyCare360, we believe every child deserves premium attention and tracking. Our smart health and habit logging platform is a safe, nurturing space supporting parents on their journey.
            </p>
          </div>
          <div className="kido-footer-links-col">
            <h3>Quick Links</h3>
            <ul className="kido-footer-links">
              <li><a href="/">Care Dashboard</a></li>
              <li><a href="/login">User Access</a></li>
              <li><a href="/register">Register Profile</a></li>
            </ul>
          </div>
          <div className="kido-footer-links-col">
            <h3>Support & Contact</h3>
            <ul className="kido-footer-links">
              <li><span>Phone: (+48) 254 76243</span></li>
              <li><span>Email: info@Kiddly.com</span></li>
              <li><span>Location: 123 Care Street, Baby City</span></li>
            </ul>
          </div>
        </div>
        <div className="kido-footer-bottom">
          <span>&copy; {new Date().getFullYear()} BabyCare360. All Rights Reserved.</span>
          <span>Happy starts, healthy routines.</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
