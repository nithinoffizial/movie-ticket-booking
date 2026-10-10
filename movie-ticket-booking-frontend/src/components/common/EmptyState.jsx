import React from 'react';
import { Clapperboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = Clapperboard,
  title = 'No Records Found',
  message = 'There are currently no items matching your criteria in the system.',
  actionText = '',
  actionLink = '',
  onAction = null,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        background: 'var(--bg-card)',
        border: '1px dashed var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '560px',
        margin: '2rem auto',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-dim)',
        }}
      >
        <Icon size={30} />
      </div>

      <div>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.35rem' }}>{title}</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto' }}>
          {message}
        </p>
      </div>

      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button onClick={onAction} className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
