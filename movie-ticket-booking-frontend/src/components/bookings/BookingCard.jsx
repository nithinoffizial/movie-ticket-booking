import React from 'react';
import { Ticket, Film, Calendar, Clock, MapPin, User, Armchair, QrCode } from 'lucide-react';

const BookingCard = ({ booking }) => {
  if (!booking) return null;

  const {
    bookingId,
    customer,
    show,
    seatsBooked,
    totalAmount,
    bookingDate,
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

  const formatBookingTimestamp = (ts) => {
    if (!ts) return 'N/A';
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="ticket-wrapper">
      {/* Ticket Header */}
      <div className="ticket-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(229, 9, 20, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-red)',
            }}
          >
            <Ticket size={18} />
          </div>
          <div>
            <span className="ticket-id-tag">CONFIRMED PASS #{bookingId}</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Booked on {formatBookingTimestamp(bookingDate)}
            </div>
          </div>
        </div>

        <span className="badge badge-emerald">Active Booking</span>
      </div>

      {/* Ticket Body Details */}
      <div className="ticket-body">
        {/* Movie Details */}
        <div className="ticket-info-item">
          <span className="ticket-info-label">Movie</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Film size={15} color="var(--accent-red)" />
            <span className="ticket-info-value">{movie?.title || 'Unknown Title'}</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {movie?.language || ''} {movie?.genre ? `• ${movie.genre}` : ''}
          </span>
        </div>

        {/* Customer Details */}
        <div className="ticket-info-item">
          <span className="ticket-info-label">Customer</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={15} color="var(--accent-cyan)" />
            <span className="ticket-info-value">{customer?.name || 'Guest'}</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {customer?.phone || customer?.email || ''}
          </span>
        </div>

        {/* Theatre Details */}
        <div className="ticket-info-item">
          <span className="ticket-info-label">Cinema Hall</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={15} color="var(--accent-gold)" />
            <span className="ticket-info-value">{theatre?.name || 'Cinema Theatre'}</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {theatre?.location || ''}
          </span>
        </div>

        {/* Date & Showtime */}
        <div className="ticket-info-item">
          <span className="ticket-info-label">Show Schedule</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={15} color="var(--accent-emerald)" />
            <span className="ticket-info-value">
              {formatShowDate(show?.showDate)} at {formatShowTime(show?.showTime)}
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            ₹{Number(show?.ticketPrice || 0).toFixed(0)} / ticket
          </span>
        </div>
      </div>

      {/* Ticket Footer with Seats and Total Amount */}
      <div className="ticket-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              color: '#ffffff',
            }}
          >
            <Armchair size={16} color="var(--accent-gold)" />
            <span>
              <strong>{seatsBooked}</strong> {seatsBooked === 1 ? 'Seat' : 'Seats'}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
            Total Paid
          </span>
          <div className="ticket-amount-val">
            ₹{Number(totalAmount).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
