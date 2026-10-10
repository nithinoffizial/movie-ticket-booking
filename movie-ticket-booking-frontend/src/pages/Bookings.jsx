import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Ticket, Search, Armchair, RefreshCw } from 'lucide-react';
import bookingService from '../services/bookingService';
import BookingCard from '../components/bookings/BookingCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getAllBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError({
        message: err.message || 'Unable to retrieve booking records from database.',
        endpoint: 'GET /bookings',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    bookingService.getAllBookings()
      .then((data) => {
        if (active) setBookings(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) {
          console.error('Error fetching bookings:', err);
          setError({
            message: err.message || 'Unable to retrieve booking records from database.',
            endpoint: 'GET /bookings',
          });
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Compute aggregated stats
  const stats = useMemo(() => {
    const totalCount = bookings.length;
    const totalSeats = bookings.reduce((acc, b) => acc + (Number(b.seatsBooked) || 0), 0);
    const totalRevenue = bookings.reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0);
    return { totalCount, totalSeats, totalRevenue };
  }, [bookings]);

  // Search filter
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const term = searchTerm.toLowerCase();
        const idMatch = String(b.bookingId).includes(term);
        const movieMatch = b.show?.movie?.title?.toLowerCase().includes(term);
        const customerMatch = b.customer?.name?.toLowerCase().includes(term);
        const theatreMatch = b.show?.theatre?.name?.toLowerCase().includes(term);
        return idMatch || movieMatch || customerMatch || theatreMatch;
      })
      .sort((a, b) => b.bookingId - a.bookingId); // Most recent bookings first
  }, [bookings, searchTerm]);

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="section-header">
        <div className="section-title-wrap">
          <span className="section-subtitle">Database Records</span>
          <h1 className="section-title">
            <Ticket size={32} color="var(--accent-red)" />
            <span>Booking History</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            View verified reservations recorded in the database, complete with seat counts, pricing, and audit timestamps.
          </p>
        </div>

        <button onClick={fetchBookings} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Aggregate Stats Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Bookings
            </span>
            <Ticket size={18} color="var(--accent-red)" />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
            {stats.totalCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Seats Reserved
            </span>
            <Armchair size={18} color="var(--accent-gold)" />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
            {stats.totalSeats}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Amount Processed
            </span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '1.1rem' }}>₹</span>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.35rem' }}>
            ₹{stats.totalRevenue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search bookings by movie, customer name, theatre, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Showing {filteredBookings.length} {filteredBookings.length === 1 ? 'ticket' : 'tickets'}
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <LoadingState message="Fetching booking history from MySQL database..." />
      ) : error ? (
        <ErrorState
          title="Could Not Load Bookings"
          message={error.message}
          endpoint={error.endpoint}
          onRetry={fetchBookings}
        />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No Bookings Recorded"
          message={
            searchTerm
              ? 'No bookings matched your search query. Try clearing your search term.'
              : 'There are no movie ticket reservations stored in the database yet.'
          }
          actionText={searchTerm ? 'Clear Search' : 'Book a Movie Ticket'}
          actionLink={searchTerm ? '' : '/booking'}
          onAction={searchTerm ? () => setSearchTerm('') : null}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.bookingId} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
