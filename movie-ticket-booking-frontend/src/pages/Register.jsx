import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { useToast } from '../context/ToastContext';
import { Lock, User, Mail, Phone, Film, AlertCircle, UserPlus, CheckCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.username.trim() || !formData.password || !formData.confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register(formData);
      const msg = response?.message || 'Registration successful! Please sign in.';
      setSuccessMessage(msg);
      addToast('Account created successfully! Please sign in.', 'success');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      console.error('Registration failed:', err);
      const msg = err.message || 'Registration failed. Please check your details and try again.';
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
          maxWidth: '520px',
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
            Create Your Cine<span style={{ color: 'var(--accent-red)' }}>Pass</span> Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Join CinePass to reserve seats and get instant digital tickets
          </p>
        </div>

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

        {/* Success Alert */}
        {successMessage && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              color: 'var(--accent-emerald)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
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

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="e.g. name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail
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

          {/* Phone Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-phone">
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Phone
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

          {/* Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">
              Username *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-username"
                name="username"
                type="text"
                className="form-input"
                placeholder="Choose a unique username"
                value={formData.username}
                onChange={handleChange}
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

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                name="password"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm-password">
              Confirm Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-confirm-password"
                name="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Re-type your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
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
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            <UserPlus size={18} />
            <span>{isLoading ? 'Creating Account...' : 'Sign Up'}</span>
          </button>
        </form>

        {/* Link back to login */}
        <div style={{ marginTop: '1.75rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-red)', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
