import React from 'react';
import { Ticket, Film, Calendar, Clock, MapPin, User, Armchair, Printer } from 'lucide-react';

const DigitalTicketCard = ({ ticket, onPrint }) => {
  if (!ticket) return null;

  const {
    ticketNumber,
    movie,
    movieGenre,
    theatre,
    theatreLocation,
    showDate,
    showTime,
    seats = [],
    ticketPrice,
    numberOfSeats,
    totalAmount,
    bookingDate,
    status = 'CONFIRMED',
    customer,
    customerEmail,
  } = ticket;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
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

  const formatTime = (timeStr) => {
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
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div
      className="digital-ticket-pass"
      style={{
        background: 'var(--ticket-bg)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '560px',
        margin: '0 auto',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, #b91c1c 0%, #e50914 100%)',
          padding: '0.75rem clamp(0.75rem, 3vw, 1.5rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Ticket size={20} style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 'clamp(0.78rem, 2vw, 0.9rem)' }}>
            CINEMA DIGITAL ADMIT PASS
          </span>
        </div>
        <span
          style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          {status}
        </span>
      </div>

      {/* Main Body */}
      <div style={{ padding: 'clamp(1rem, 3.5vw, 1.75rem)' }}>
        {/* Ticket Header & Number */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Pass Number
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.05em', overflowWrap: 'break-word' }}>
              {ticketNumber || 'TKT-PENDING'}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePrint}
            title="Print Ticket"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            <Printer size={15} />
            <span>Print</span>
          </button>
        </div>

        {/* Movie Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <Film size={20} color="var(--accent-red)" style={{ flexShrink: 0 }} />
            <h2 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.6rem)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, overflowWrap: 'break-word' }}>
              {movie || 'Movie Title'}
            </h2>
          </div>
          {movieGenre && (
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
              {movieGenre}
            </span>
          )}
        </div>

        {/* Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
            gap: '1.25rem',
            background: 'var(--bg-secondary)',
            padding: 'clamp(0.85rem, 2.5vw, 1.25rem)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
          }}
        >
          {/* Theatre */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
              <MapPin size={14} />
              <span>THEATRE & LOCATION</span>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{theatre || 'N/A'}</div>
            {theatreLocation && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{theatreLocation}</div>
            )}
          </div>

          {/* Customer */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
              <User size={14} />
              <span>PASSENGER / CUSTOMER</span>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{customer || 'N/A'}</div>
            {customerEmail && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{customerEmail}</div>
            )}
          </div>

          {/* Date */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
              <Calendar size={14} />
              <span>SHOW DATE</span>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              {formatDate(showDate)}
            </div>
          </div>

          {/* Time */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
              <Clock size={14} />
              <span>SHOW TIME</span>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              {formatTime(showTime)}
            </div>
          </div>
        </div>

        {/* Selected Seats Banner */}
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 600 }}>
              <Armchair size={16} />
              <span>RESERVED SEAT(S)</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {Array.isArray(seats) && seats.length > 0 ? (
                seats.map((s) => (
                  <span
                    key={s}
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '4px',
                      boxShadow: '0 0 6px rgba(16,185,129,0.4)',
                    }}
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--text-dim)' }}>None</span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Seat Count</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {numberOfSeats || seats.length || 1}
            </div>
          </div>
        </div>

        {/* Perforated Divider */}
        <div
          style={{
            borderTop: '2px dashed var(--border-subtle)',
            margin: '1rem -1.75rem 1.25rem',
            position: 'relative',
          }}
        />

        {/* Price & Barcode Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {ticketPrice ? `₹${ticketPrice} × ${numberOfSeats || seats.length} seats` : 'Total Paid'}
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              ₹{Number(totalAmount || 0).toFixed(2)}
            </div>
            {bookingDate && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                Booked on {formatDate(bookingDate)}
              </div>
            )}
          </div>

          {/* Barcode Graphic Simulation */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'flex',
                gap: '2px',
                height: '32px',
                alignItems: 'stretch',
                opacity: 0.8,
              }}
            >
              {[3, 1, 4, 1, 5, 2, 1, 3, 2, 4, 1, 2, 5, 1, 2, 4, 2, 1, 3, 1, 4, 2, 1].map((w, idx) => (
                <span
                  key={idx}
                  style={{
                    width: `${w}px`,
                    background: 'var(--text-primary)',
                    display: 'inline-block',
                  }}
                />
              ))}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              {ticketNumber || 'VALID DIGITAL PASS'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTicketCard;
