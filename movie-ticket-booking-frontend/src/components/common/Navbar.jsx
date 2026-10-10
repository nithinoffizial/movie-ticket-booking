import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Menu, X, Ticket, LogOut, LogIn, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, isCustomer, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboardActive = location.pathname === '/admin' || location.pathname === '/admin/dashboard';
  const isSupportActive = location.pathname === '/admin/support' || location.pathname.startsWith('/admin/support/');

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    closeMobileMenu();
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={closeMobileMenu}>
          <div className="brand-icon-wrap">
            <Film size={20} />
          </div>
          <span>
            Cine<span className="brand-accent">Pass</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav>
          <ul className="nav-links">
            {/* Common Public Links */}
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/movies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Movies
              </NavLink>
            </li>
            <li>
              <NavLink to="/theatres" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Theatres
              </NavLink>
            </li>
            {!isAdmin && (
              <li>
                <NavLink to="/support" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Support
                </NavLink>
              </li>
            )}

            {/* Admin Links */}
            {isAdmin && (
              <>
                <li>
                  <NavLink
                    to="/admin"
                    end
                    className={`nav-link ${isDashboardActive ? 'active' : ''}`}
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/support"
                    className={`nav-link ${isSupportActive ? 'active' : ''}`}
                  >
                    Support Desk
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Bookings
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/customers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Customers
                  </NavLink>
                </li>
              </>
            )}

            {/* Customer Links */}
            {isCustomer && (
              <>
                <li>
                  <NavLink to="/booking" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Book Tickets
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/my-bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    My Bookings
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/my-tickets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    My Tickets
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    My Profile
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions">
          {/* Sun/Moon Theme Toggle */}
          <button
            type="button"
            id="theme-toggle-btn"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? (
              <Sun size={18} className="theme-toggle-icon" />
            ) : (
              <Moon size={18} className="theme-toggle-icon" />
            )}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/booking" className="btn btn-primary btn-sm" onClick={closeMobileMenu}>
                <Ticket size={16} />
                <span className="nav-btn-text">Book Now</span>
              </Link>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleLogout}
                title="Log Out"
                style={{ padding: '0.45rem 0.65rem' }}
              >
                <LogOut size={16} />
                <span className="nav-btn-text">Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-primary btn-sm" onClick={closeMobileMenu}>
                <LogIn size={16} />
                <span className="nav-btn-text">Sign In</span>
              </Link>
            </div>
          )}

          <button
            className="mobile-toggle-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <NavLink
          to="/"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobileMenu}
          end
        >
          Home
        </NavLink>
        <NavLink
          to="/movies"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          Movies
        </NavLink>
        <NavLink
          to="/theatres"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          Theatres
        </NavLink>
        {!isAdmin && (
          <NavLink
            to="/support"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Customer Support
          </NavLink>
        )}

        {isAdmin && (
          <>
            <NavLink
              to="/admin"
              end
              className={`mobile-nav-link ${isDashboardActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Admin Dashboard
            </NavLink>
            <NavLink
              to="/admin/support"
              className={`mobile-nav-link ${isSupportActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Support Desk
            </NavLink>
            <NavLink
              to="/bookings"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              All Bookings
            </NavLink>
            <NavLink
              to="/customers"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Customers Directory
            </NavLink>
          </>
        )}

        {isCustomer && (
          <>
            <NavLink
              to="/booking"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Book Tickets
            </NavLink>
            <NavLink
              to="/my-bookings"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              My Bookings
            </NavLink>
            <NavLink
              to="/my-tickets"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              My Digital Tickets
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              My Profile
            </NavLink>
          </>
        )}

        {/* Mobile Theme Toggle */}
        <div className="mobile-theme-row">
          <span>Appearance</span>
          <button
            type="button"
            id="mobile-theme-toggle-btn"
            onClick={toggleTheme}
            className="mobile-theme-btn"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={16} />
                <span>Light Theme</span>
              </>
            ) : (
              <>
                <Moon size={16} />
                <span>Dark Theme</span>
              </>
            )}
          </button>
        </div>

        {isAuthenticated ? (
          <button
            type="button"
            className="btn btn-secondary btn-md"
            onClick={handleLogout}
            style={{ marginTop: '1rem', width: '100%' }}
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="btn btn-primary btn-md"
            onClick={closeMobileMenu}
            style={{ marginTop: '1rem', width: '100%' }}
          >
            <LogIn size={16} />
            <span>Sign In to CinePass</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
