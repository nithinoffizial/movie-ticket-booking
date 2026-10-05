import React from 'react';
import { AlertTriangle, RefreshCw, ServerCrash } from 'lucide-react';

const ErrorState = ({
  title = 'Unable to Load Data',
  message = 'There was an issue connecting to the backend service.',
  endpoint = '',
  onRetry = null,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        background: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '540px',
        margin: '2rem auto',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f87171',
        }}
      >
        <ServerCrash size={28} />
      </div>

      <div>
        <h4 style={{ color: '#ffffff', marginBottom: '0.35rem' }}>{title}</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px' }}>
          {message}
        </p>
      </div>

      {endpoint && (
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            color: '#fca5a5',
          }}
        >
          Affected Endpoint: {endpoint}
        </div>
      )}

      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
          <RefreshCw size={15} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
