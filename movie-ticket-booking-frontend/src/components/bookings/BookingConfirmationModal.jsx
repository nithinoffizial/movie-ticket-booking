import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Armchair, ArrowRight, Printer } from 'lucide-react';
import Modal from '../common/Modal';

const BookingConfirmationModal = ({ isOpen, onClose, booking }) => {
  if (!booking) return null;

  const {
    bookingId,
    customer,
    show,
    seatsBooked,
    totalAmount,
  } = booking;

  const movie = show?.movie;
  const theatre = show?.theatre;

  const formatShowDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatShowTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Confirmation" maxWidth="620px">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: 'var(--accent-emerald)',
          }}
        >
          <CheckCircle2 size={36} />
        </div>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Booking Confirmed!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Your movie reservation has been verified and processed by the database engine.
        </p>
      </div>

      {/* Ticket Pass View */}
      <div
        style={{
          background: 'var(--ticket-bg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px dashed var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-red)', fontWeight: 700, letterSpacing: '0.05em' }}>
              RESERVATION PASS
            </span>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Booking #{bookingId}
            </div>
          </div>
          <span className="badge badge-emerald">Payment Verified</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Movie</span>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem', marginTop: '0.15rem' }}>
              {movie?.title || 'Movie'}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {movie?.language} • {movie?.genre}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Theatre</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.98rem', marginTop: '0.15rem' }}>
              {theatre?.name}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {theatre?.location}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Date & Showtime</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: '0.15rem' }}>
              {formatShowDate(show?.showDate)}
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--accent-gold)' }}>
              {formatShowTime(show?.showTime)}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Customer</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: '0.15rem' }}>
              {customer?.name}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {customer?.email || customer?.phone}
            </span>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Reserved Seats</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontWeight: 700, fontSize: '1.1rem' }}>
              <Armchair size={18} />
              <span>{seatsBooked} {seatsBooked === 1 ? 'Seat' : 'Seats'}</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Authorized Total Amount</span>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              ₹{Number(totalAmount).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <button type="button" onClick={handlePrint} className="btn btn-secondary btn-sm">
          <Printer size={16} />
          <span>Print Pass</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            Book Another
          </button>
          <Link to="/bookings" onClick={onClose} className="btn btn-primary btn-sm">
            <span>View All Bookings</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </Modal>
  );
};

export default BookingConfirmationModal;
