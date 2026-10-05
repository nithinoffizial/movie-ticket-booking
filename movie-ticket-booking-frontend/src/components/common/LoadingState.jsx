import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = 'Loading cinema data...', height = '260px' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: height,
        width: '100%',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(229, 9, 20, 0.1)',
          border: '1px solid rgba(229, 9, 20, 0.3)',
        }}
      >
        <Loader2 size={28} className="spin-icon" color="var(--accent-red)" />
      </div>
      <div>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
          {message}
        </p>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Retrieving live data from Spring Boot backend
        </span>
      </div>
    </div>
  );
};

export default LoadingState;
