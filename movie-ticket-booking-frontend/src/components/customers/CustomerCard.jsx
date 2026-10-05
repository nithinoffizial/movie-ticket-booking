import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Edit, Trash2, Ticket } from 'lucide-react';

const CustomerCard = ({ customer, onEdit, onDelete }) => {
  if (!customer) return null;

  const { customerId, name, email, phone } = customer;

  // Generate initials for avatar
  const getInitials = (n = '') => {
    return n
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        position: 'relative',
        transition: 'all var(--transition-normal)',
      }}
      className="customer-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: '#ffffff',
              fontSize: '1rem',
            }}
          >
            {getInitials(name) || 'C'}
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700 }}>
              {name}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Customer ID #{customerId}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => onEdit(customer)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
            title="Edit Customer"
            aria-label={`Edit ${name}`}
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(customer)}
            className="btn btn-danger btn-sm"
            style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
            title="Delete Customer"
            aria-label={`Delete ${name}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.25)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <Mail size={15} color="var(--accent-cyan)" />
          <span style={{ wordBreak: 'break-all' }}>{email || 'No email provided'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <Phone size={15} color="var(--accent-emerald)" />
          <span>{phone || 'No phone provided'}</span>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
        <Link
          to={`/booking?customerId=${customerId}`}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%' }}
        >
          <Ticket size={14} />
          <span>Book Tickets for {name}</span>
        </Link>
      </div>
    </div>
  );
};

export default CustomerCard;
