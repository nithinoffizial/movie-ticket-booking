import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, User, Film, AlertCircle, LogIn, Shield, UserCircle2 } from 'lucide-react';

const Login = () => {
  const [activeTab, setActiveTab] = useState('USER'); // 'USER' | 'ADMIN'
  const [identifier, setIdentifier] = useState(''); // Username / Email for USER tab
  const [password, setPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please enter both username/email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login({ username: identifier.trim(), password });
      addToast(`Welcome back, ${user.name || user.username}!`, 'success');

      const redirectParam = new URLSearchParams(location.search).get('redirect');

      if (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') {
        navigate(redirectParam || '/admin', { replace: true });
      } else {
        const from = redirectParam || location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || 'Invalid username/email or password. Please try again.';
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!adminUsername.trim() || !adminPassword.trim()) {
      setErrorMessage('Please enter admin username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login({ username: adminUsername.trim(), password: adminPassword });
      if (user.role !== 'ROLE_ADMIN' && user.role !== 'ADMIN') {
        setErrorMessage('Access denied. This account does not possess administrator credentials.');
        addToast('Unauthorized administrator credentials.', 'error');
        return;
      }
      addToast(`Administrator access granted. Welcome, ${user.username}!`, 'success');
      const redirectParam = new URLSearchParams(location.search).get('redirect');
      navigate(redirectParam || '/admin', { replace: true });
    } catch (err) {
      console.error('Admin login error:', err);
      const msg = err.message || 'Invalid administrator credentials.';
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(1.25rem, 5vw, 2.5rem)',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(16px)',
          position: 'relative',
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(229, 9, 20, 0.15)',
              border: '1px solid rgba(229, 9, 20, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--accent-red)',
            }}
          >
            <Film size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Sign In to Cine<span style={{ color: 'var(--accent-red)' }}>Pass</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Access real-time movie bookings and account dashboard
          </p>
        </div>

        {/* User / Admin Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-input)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => handleTabChange('USER')}
            style={{
              padding: '0.65rem 1rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'USER' ? 'var(--accent-red)' : 'transparent',
              color: activeTab === 'USER' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all var(--transition-fast)',
            }}
          >
            <UserCircle2 size={16} />
            <span>USER</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('ADMIN')}
            style={{
              padding: '0.65rem 1rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'ADMIN' ? 'var(--accent-red)' : 'transparent',
              color: activeTab === 'ADMIN' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Shield size={16} />
            <span>ADMIN</span>
          </button>
        </div>

        {/* Expired Session Alert */}
        {isExpired && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              color: 'var(--accent-gold)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>Your session has expired. Please log in again to continue.</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              color: '#f87171',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* USER TAB FORM */}
        {activeTab === 'USER' && (
          <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="user-identifier">
                Username / Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="user-identifier"
                  type="text"
                  className="form-input"
                  placeholder="Enter your username or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="user-password"
                  type="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <LogIn size={18} />
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            </button>

            {/* Signup prompt for USER tab */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                New to CinePass?
              </p>
              <Link to="/register" style={{ color: 'var(--accent-red)', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
                Sign Up
              </Link>
            </div>
          </form>
        )}

        {/* ADMIN TAB FORM */}
        {activeTab === 'ADMIN' && (
          <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-username">
                Admin Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-username"
                  type="text"
                  className="form-input"
                  placeholder="Enter administrator username"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  required
                  autoComplete="username"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Shield
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--accent-red)',
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">
                Admin Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-password"
                  type="password"
                  className="form-input"
                  placeholder="Enter administrator password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <LogIn size={18} />
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
