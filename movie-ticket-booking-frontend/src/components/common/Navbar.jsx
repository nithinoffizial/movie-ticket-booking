import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Film, Menu, X, Ticket, Clapperboard } from 'lucide-react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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
          </ul>
        </nav>

        {/* Action Button & Mobile Hamburger */}
        <div className="nav-actions">
          <Link to="/booking" className="btn btn-primary btn-sm" onClick={closeMobileMenu}>
            <Ticket size={16} />
            <span>Book Now</span>
          </Link>

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
        <NavLink
          to="/bookings"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          Bookings History
        </NavLink>
        <NavLink
          to="/customers"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          Customer Directory
        </NavLink>
        <Link to="/booking" className="btn btn-primary btn-lg" onClick={closeMobileMenu} style={{ marginTop: '1rem' }}>
          <Ticket size={18} />
          <span>Book Tickets Now</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
