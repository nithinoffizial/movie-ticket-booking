import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isAdmin, isCustomer, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-wrapper" style={{ textAlign: 'center', padding: '5rem' }}>Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'ADMIN' && !isAdmin) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: '#ef4444',
          }}
        >
          <ShieldAlert size={36} />
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>403 - Access Denied</h1>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Administrator Privileges Required
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 2rem' }}>
          This section is restricted to administrators. Your current account ({user?.username}) does not have permission to view this resource.
        </p>
        <Link to="/" className="btn btn-primary btn-md">
          <ArrowLeft size={18} />
          <span>Return to Safety</span>
        </Link>
      </div>
    );
  }

  if (requiredRole === 'CUSTOMER' && !isCustomer && !isAdmin) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: '#ef4444',
          }}
        >
          <ShieldAlert size={36} />
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>403 - Access Restricted</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 2rem' }}>
          This portal requires a customer account.
        </p>
        <Link to="/" className="btn btn-primary btn-md">
          <ArrowLeft size={18} />
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
