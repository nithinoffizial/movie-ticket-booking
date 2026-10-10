import React, { useState, useEffect, useCallback } from 'react';
import bookingService from '../services/bookingService';
import ticketService from '../services/ticketService';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import DigitalTicketModal from '../components/tickets/DigitalTicketModal';
import { Ticket, Film, Calendar, Clock, CheckCircle2 } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketLoading, setTicketLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load my bookings:', err);
      setError({
        message: err.message || 'Unable to retrieve your bookings.',
        endpoint: 'GET /customer/bookings',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    bookingService.getMyBookings()
      .then((data) => {
        if (active) setBookings(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) {
          console.error('Failed to load my bookings:', err);
          setError({
            message: err.message || 'Unable to retrieve your bookings.',
            endpoint: 'GET /customer/bookings',
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleViewTicket = async (booking) => {
    setTicketLoading(true);
    try {
      // Find ticket matching booking or construct ticket response
      const tickets = await ticketService.getMyTickets();
      const match = (tickets || []).find((t) => t.bookingId === booking.bookingId);
      if (match) {
        setSelectedTicket(match);
      } else {
        // Fallback using booking data
        setSelectedTicket({
          ticketNumber: booking.ticketNumber || `TKT-BOOK-${booking.bookingId}`,
          movie: booking.movie,
          theatre: booking.theatre,
          theatreLocation: booking.theatreLocation,
          showDate: booking.showDate,
          showTime: booking.showTime,
          seats: booking.seats,
          ticketPrice: booking.ticketPrice,
          numberOfSeats: booking.numberOfSeats,
          totalAmount: booking.totalAmount,
          bookingDate: booking.bookingDate,
          status: booking.status || 'CONFIRMED',
          customer: booking.customerName,
          customerEmail: booking.customerEmail,
        });
      }
      setIsTicketModalOpen(true);
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      // Fallback
      setSelectedTicket({
        ticketNumber: booking.ticketNumber,
        movie: booking.movie,
        theatre: booking.theatre,
        theatreLocation: booking.theatreLocation,
        showDate: booking.showDate,
        showTime: booking.showTime,
        seats: booking.seats,
        ticketPrice: booking.ticketPrice,
        numberOfSeats: booking.numberOfSeats,
        totalAmount: booking.totalAmount,
        bookingDate: booking.bookingDate,
        status: booking.status || 'CONFIRMED',
        customer: booking.customerName,
        customerEmail: booking.customerEmail,
      });
      setIsTicketModalOpen(true);
    } finally {
      setTicketLoading(false);
    }
  };

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

  return (
    <div className="page-wrapper">
      <div className="section-header">
        <div className="section-title-wrap">
          <span className="section-subtitle">Personal Reservations</span>
          <h1 className="section-title">
            <Ticket size={32} color="var(--accent-red)" />
            <span>My Bookings</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Review your past and upcoming movie reservations, seat selections, and payment receipts.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading your bookings history..." />
      ) : error ? (
        <ErrorState
          title="Failed to Load Bookings"
          message={error.message}
          endpoint={error.endpoint}
          onRetry={fetchBookings}
        />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No Bookings Yet"
          message="You haven't reserved any movie tickets yet. Explore active showtimes and pick your seats!"
          actionLabel="Browse Movies"
          actionLink="/movies"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '880px', margin: '0 auto' }}>
          {bookings.map((b) => (
            <div
              key={b.bookingId}
              className="card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(1rem, 3vw, 1.5rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition-normal)',
              }}
            >
              {/* Top Row: Ticket Number & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(229, 9, 20, 0.15)',
                      color: 'var(--accent-red)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Film size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Booking ID #{b.bookingId}
                    </span>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8', fontSize: '1rem', overflowWrap: 'break-word' }}>
                      {b.ticketNumber || 'TKT-PENDING'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-emerald">
                    <CheckCircle2 size={13} style={{ marginRight: '4px' }} />
                    {b.status || 'CONFIRMED'}
                  </span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleViewTicket(b)}
                    disabled={ticketLoading}
                  >
                    <Ticket size={15} />
                    <span>View Ticket</span>
                  </button>
                </div>
              </div>

              {/* Middle Row: Movie, Theatre, Details */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
                  gap: '1.25rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Movie Title</span>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {b.movie}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Theatre & Screen</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {b.theatre}
                  </div>
                  {b.theatreLocation && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{b.theatreLocation}</div>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Show Schedule</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.9rem' }}>
                    <Calendar size={14} color="var(--accent-cyan)" />
                    <span>{formatDate(b.showDate)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', marginTop: '0.15rem', fontSize: '0.9rem' }}>
                    <Clock size={14} color="var(--accent-gold)" />
                    <span>{formatTime(b.showTime)}</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reserved Seats</span>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                    {Array.isArray(b.seats) && b.seats.length > 0 ? (
                      b.seats.map((s) => (
                        <span
                          key={s}
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: 'var(--seat-selected)',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
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
              </div>

              {/* Bottom Row: Total & Date */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Booked on {formatDate(b.bookingDate)}
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Total Paid:</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    ₹{Number(b.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Digital Ticket Modal */}
      <DigitalTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        ticket={selectedTicket}
      />
    </div>
  );
};

export default MyBookings;
