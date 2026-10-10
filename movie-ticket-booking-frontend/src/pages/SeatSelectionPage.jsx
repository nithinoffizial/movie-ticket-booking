import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import showService from '../services/showService';
import seatService from '../services/seatService';
import bookingService from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SeatGrid from '../components/seats/SeatGrid';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import DigitalTicketModal from '../components/tickets/DigitalTicketModal';
import { Film, Calendar, Clock, MapPin, ArrowLeft, Ticket, AlertCircle } from 'lucide-react';

const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const fetchShowAndSeats = useCallback(async () => {
    if (!showId) return;
    try {
      const [showData, seatsData] = await Promise.all([
        showService.getShowById(showId),
        seatService.getSeatsByShowId(showId),
      ]);
      setShow(showData);
      setSeats(Array.isArray(seatsData) ? seatsData : []);
    } catch (err) {
      console.error('Failed to load show seats:', err);
      setError({
        message: err.message || 'Unable to retrieve cinema seating layout.',
        endpoint: `GET /shows/${showId}/seats`,
      });
    } finally {
      setLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    let active = true;
    if (showId) {
      Promise.all([
        showService.getShowById(showId),
        seatService.getSeatsByShowId(showId),
      ]).then(([showData, seatsData]) => {
        if (active) {
          setShow(showData);
          setSeats(Array.isArray(seatsData) ? seatsData : []);
        }
      }).catch((err) => {
        if (active) {
          console.error('Failed to load show seats:', err);
          setError({
            message: err.message || 'Unable to retrieve cinema seating layout.',
            endpoint: `GET /shows/${showId}/seats`,
          });
        }
      }).finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [showId]);

  const handleToggleSeat = (seatNumber) => {
    setBookingError('');
    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        return prev.filter((s) => s !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  const handleConfirmBooking = async () => {
    setBookingError('');

    if (selectedSeats.length === 0) {
      setBookingError('Please select at least 1 seat before confirming reservation.');
      return;
    }

    if (!isAuthenticated) {
      addToast('Please sign in to complete your ticket reservation.', 'info');
      navigate('/login', { state: { from: { pathname: `/shows/${showId}/seats` } } });
      return;
    }

    setIsBooking(true);
    try {
      const payload = {
        showId: Number(showId),
        seatNumbers: selectedSeats,
      };

      const ticketResult = await bookingService.createBooking(payload);
      addToast('Reservation confirmed! Digital ticket issued.', 'success');
      setConfirmedTicket(ticketResult);
      setIsTicketModalOpen(true);
      setSelectedSeats([]);

      // Refresh seats to mark newly booked seats as RED
      const updatedSeats = await seatService.getSeatsByShowId(showId);
      setSeats(Array.isArray(updatedSeats) ? updatedSeats : []);
    } catch (err) {
      console.error('Booking failed:', err);
      const msg = err.message || 'Failed to complete ticket booking transaction.';
      setBookingError(msg);
      addToast(msg, 'error');
    } finally {
      setIsBooking(false);
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
      {/* Top Breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Shows</span>
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading cinema layout and real-time seat availability..." />
      ) : error ? (
        <ErrorState
          title="Seating Chart Unavailable"
          message={error.message}
          endpoint={error.endpoint}
          onRetry={fetchShowAndSeats}
        />
      ) : show ? (
        <div>
          {/* Show Header Information Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              padding: 'clamp(1rem, 3vw, 1.75rem)',
              marginBottom: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <Film size={22} color="var(--accent-red)" style={{ flexShrink: 0 }} />
                <h1 style={{ fontSize: 'clamp(1.35rem, 3.5vw, 1.75rem)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, overflowWrap: 'break-word' }}>
                  {show.movie?.title}
                </h1>
                {show.movie?.genre && <span className="badge badge-primary">{show.movie.genre}</span>}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  <span>{show.theatre?.name} ({show.theatre?.location})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={15} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                  <span>{formatDate(show.showDate)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={15} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                  <span>{formatTime(show.showTime)}</span>
                </div>
              </div>
            </div>

            {/* Availability Counter */}
            <div
              style={{
                textAlign: 'left',
                background: 'var(--bg-glass)',
                padding: '0.65rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Seats Available
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {show.availableSeats} <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>/ {show.totalSeats}</span>
              </div>
            </div>
          </div>

          {/* Validation or Booking Error Alert */}
          {bookingError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1.25rem',
                marginBottom: '1.5rem',
                color: '#f87171',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                maxWidth: '680px',
                margin: '0 auto 1.5rem',
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{bookingError}</span>
            </div>
          )}

          {/* Graphical Cinema Seat Grid */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(1.25rem, 3.5vw, 2.5rem) clamp(0.75rem, 2.5vw, 1.5rem)',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '2rem',
            }}
          >
            <SeatGrid
              seats={seats}
              selectedSeats={selectedSeats}
              onToggleSeat={handleToggleSeat}
              ticketPrice={show.ticketPrice}
            />

            {/* Booking Confirmation Action */}
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleConfirmBooking}
                disabled={isBooking || selectedSeats.length === 0}
                style={{
                  padding: '0.85rem clamp(1.25rem, 4vw, 2.5rem)',
                  fontSize: '1.05rem',
                  maxWidth: '100%',
                  width: 'auto',
                  whiteSpace: 'normal',
                  lineHeight: 1.35,
                  boxShadow: selectedSeats.length > 0 ? '0 0 25px rgba(229, 9, 20, 0.45)' : 'none',
                }}
              >
                <Ticket size={20} style={{ flexShrink: 0 }} />
                <span>
                  {isBooking
                    ? 'Processing Reservation...'
                    : selectedSeats.length > 0
                    ? `Confirm & Book ${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''} (₹${(selectedSeats.length * show.ticketPrice).toFixed(2)})`
                    : 'Select Seats to Proceed'}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Confirmed Digital Ticket Modal */}
      <DigitalTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false);
          navigate('/my-bookings');
        }}
        ticket={confirmedTicket}
      />
    </div>
  );
};

export default SeatSelectionPage;
