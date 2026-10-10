import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/axios';

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Brand Information */}
        <div className="footer-brand">
          <Link to="/" className="brand-logo">
            <div className="brand-icon-wrap">
              <Film size={20} />
            </div>
            <span>
              Cine<span className="brand-accent">Pass</span>
            </span>
          </Link>
          <p className="footer-desc">
            Your premier movie ticket reservation platform. Book blockbuster movies at top theatres with instant seat confirmations powered by high-performance Spring Boot and MySQL database engine.
          </p>
          <div className="backend-status-pill">
            <span className="backend-status-dot"></span>
            <span>Connected: {API_BASE_URL}</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Navigation</h4>
          <ul className="footer-links">
            <li><Link to="/" className="footer-link">Home Showcase</Link></li>
            <li><Link to="/movies" className="footer-link">Now Showing</Link></li>
            <li><Link to="/theatres" className="footer-link">Partner Theatres</Link></li>
            <li><Link to="/booking" className="footer-link">Book Tickets</Link></li>
          </ul>
        </div>

        {/* Role-Aware Section */}
        <div className="footer-col">
          {isAuthenticated && isAdmin ? (
            <>
              <h4 className="footer-heading">Administration</h4>
              <ul className="footer-links">
                <li><Link to="/admin" className="footer-link">Admin Dashboard</Link></li>
                <li><Link to="/bookings" className="footer-link">Booking Records</Link></li>
                <li><Link to="/customers" className="footer-link">Registered Customers</Link></li>
                <li><Link to="/admin/support" className="footer-link">Support Desk</Link></li>
              </ul>
            </>
          ) : isAuthenticated ? (
            <>
              <h4 className="footer-heading">My CinePass</h4>
              <ul className="footer-links">
                <li><Link to="/my-bookings" className="footer-link">My Bookings</Link></li>
                <li><Link to="/my-tickets" className="footer-link">My Tickets</Link></li>
                <li><Link to="/profile" className="footer-link">My Profile</Link></li>
                <li><Link to="/support" className="footer-link">Customer Support</Link></li>
              </ul>
            </>
          ) : (
            <>
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/movies" className="footer-link">Explore Movies</Link></li>
                <li><Link to="/theatres" className="footer-link">Find Theatres</Link></li>
                <li><Link to="/login" className="footer-link">Sign In</Link></li>
                <li><Link to="/support" className="footer-link">Customer Support</Link></li>
              </ul>
            </>
          )}
        </div>

        {/* Experience & Security */}
        <div className="footer-col">
          <h4 className="footer-heading">Experience</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Instant ticket delivery with synchronized seat inventory, stored procedure transactions, and real-time triggers.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            <ShieldCheck size={16} color="var(--accent-emerald)" />
            <span>Secure Database Transactions</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          © {CURRENT_YEAR} CinePass Movie Ticketing System. Crafted for high performance.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span>Powered by React, Vite & Spring Boot</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
