import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import customerService from '../services/customerService';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { User, Mail, Phone, Ticket, ShieldCheck, LogOut, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError({
        message: err.message || 'Unable to retrieve customer profile.',
        endpoint: 'GET /customer/profile',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    customerService.getProfile()
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch((err) => {
        if (active) {
          console.error('Failed to load profile:', err);
          setError({
            message: err.message || 'Unable to retrieve customer profile.',
            endpoint: 'GET /customer/profile',
          });
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="section-header">
        <div className="section-title-wrap">
          <span className="section-subtitle">Account Details</span>
          <h1 className="section-title">
            <User size={32} color="var(--accent-red)" />
            <span>My Profile</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage your personal profile, linked credentials, and cinema booking statistics.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading your account profile..." />
      ) : error ? (
        <ErrorState
          title="Profile Unavailable"
          message={error.message}
          endpoint={error.endpoint}
          onRetry={fetchProfile}
        />
      ) : profile ? (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(1.25rem, 4vw, 2.5rem)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Avatar & Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 800,
                boxShadow: '0 0 20px rgba(229, 9, 20, 0.4)',
                flexShrink: 0,
              }}
            >
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem', overflowWrap: 'break-word' }}>
                {profile.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-emerald">Verified Customer</span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                  @{profile.username}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <Mail size={15} />
                <span>EMAIL ADDRESS</span>
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{profile.email}</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <Phone size={15} />
                <span>PHONE NUMBER</span>
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{profile.phone || 'N/A'}</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <Ticket size={15} />
                <span>TOTAL BOOKINGS</span>
              </div>
              <div style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '1.25rem' }}>
                {profile.totalBookings}
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <ShieldCheck size={15} />
                <span>ACTIVE TICKETS</span>
              </div>
              <div style={{ color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '1.25rem' }}>
                {profile.totalTickets}
              </div>
            </div>
          </div>

          {/* Quick Navigation Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/my-bookings" className="btn btn-secondary btn-sm">
                <span>View Bookings</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/my-tickets" className="btn btn-secondary btn-sm">
                <span>View Tickets</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <button type="button" onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ color: '#ef4444' }}>
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Profile;
