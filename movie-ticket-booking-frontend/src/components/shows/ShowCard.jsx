import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Ticket, Armchair, ShieldAlert } from 'lucide-react';

const ShowCard = ({ show, onSelect = null, isSelected = false }) => {
  if (!show) return null;

  const {
    showId,
    movie,
    theatre,
    showDate,
    showTime,
    ticketPrice,
    totalSeats,
    availableSeats,
  } = show;

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
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

  // Format time (e.g. "18:00:00" -> "06:00 PM")
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const seatsPercentage = totalSeats > 0 ? (availableSeats / totalSeats) * 100 : 0;
  const isSoldOut = availableSeats <= 0;
  const isFillingFast = availableSeats > 0 && availableSeats <= 20;

  return (
    <div
      className={`show-card ${isSelected ? 'selected' : ''}`}
      style={isSelected ? { borderColor: 'var(--accent-red)', boxShadow: '0 0 20px var(--accent-red-glow)' } : {}}
    >
      {/* Header with Theatre Name & Ticket Price */}
      <div className="show-card-header">
        <div>
          <h4 className="show-theatre-name">{theatre?.name || 'Grand Cinema'}</h4>
          <div className="show-location">
            <MapPin size={14} color="var(--accent-red)" />
            <span>{theatre?.location || 'Downtown Location'}</span>
          </div>
        </div>

        <div className="show-price-tag">
          <span className="price-currency">Ticket Price</span>
          <div className="price-amount">₹{Number(ticketPrice).toFixed(0)}</div>
        </div>
      </div>

      {/* Date & Time Strip */}
      <div className="show-timing-strip">
        <div className="timing-item">
          <Calendar size={15} color="var(--accent-gold)" />
          <span>{formatDate(showDate)}</span>
        </div>
        <div className="chip-divider" />
        <div className="timing-item">
          <Clock size={15} color="var(--accent-cyan)" />
          <span style={{ fontWeight: 700, color: '#ffffff' }}>{formatTime(showTime)}</span>
        </div>
      </div>

      {/* Seats Availability Bar */}
      <div className="seats-status-bar">
        <div className="seats-label-row">
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Armchair size={14} />
            <span>Available Seats:</span>
          </span>
          <span
            style={{
              fontWeight: 700,
              color: isSoldOut ? '#ef4444' : isFillingFast ? '#f59e0b' : '#10b981',
            }}
          >
            {isSoldOut ? 'Sold Out' : `${availableSeats} of ${totalSeats}`}
          </span>
        </div>

        <div className="seats-progress-track">
          <div
            className="seats-progress-fill"
            style={{
              width: `${Math.max(0, Math.min(100, seatsPercentage))}%`,
              backgroundColor: isSoldOut ? '#ef4444' : isFillingFast ? '#f59e0b' : '#10b981',
            }}
          />
        </div>
      </div>

      {/* Action CTA */}
      <div style={{ marginTop: '0.5rem' }}>
        {onSelect ? (
          <button
            type="button"
            className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ width: '100%' }}
            onClick={() => onSelect(show)}
            disabled={isSoldOut}
          >
            <Ticket size={15} />
            <span>{isSoldOut ? 'Show Sold Out' : isSelected ? 'Show Selected' : 'Select This Show'}</span>
          </button>
        ) : (
          <Link
            to={`/booking?showId=${showId}`}
            className="btn btn-primary btn-sm"
            style={{ width: '100%' }}
            onClick={(e) => {
              if (isSoldOut) e.preventDefault();
            }}
          >
            <Ticket size={15} />
            <span>{isSoldOut ? 'Show Sold Out' : 'Book Tickets'}</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ShowCard;
