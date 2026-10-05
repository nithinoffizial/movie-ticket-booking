import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Ticket,
  User,
  Film,
  Calendar,
  Clock,
  MapPin,
  Armchair,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Info,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import customerService from '../services/customerService';
import showService from '../services/showService';
import bookingService from '../services/bookingService';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import BookingConfirmationModal from '../components/bookings/BookingConfirmationModal';
import CustomerModal from '../components/customers/CustomerModal';
import { useToast } from '../context/ToastContext';
import { getMovieVisuals } from '../utils/movieAssets';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const queryShowId = searchParams.get('showId');
  const queryMovieId = searchParams.get('movieId');
  const queryCustomerId = searchParams.get('customerId');

  // Core Data
  const [customers, setCustomers] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Selections
  const [selectedCustomerId, setSelectedCustomerId] = useState(queryCustomerId || '');
  const [selectedShowId, setSelectedShowId] = useState(queryShowId || '');
  const [seatsBooked, setSeatsBooked] = useState(1);

  // Submission & Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Quick Add Customer Modal
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  // Validation feedback
  const [validationError, setValidationError] = useState('');

  // Fetch Customers & Shows
  const fetchBookingPrerequisites = async () => {
    setLoading(true);
    setError(null);
    try {
      const [customersRes, showsRes] = await Promise.all([
        customerService.getAllCustomers(),
        showService.getAllShows(),
      ]);

      const customerList = Array.isArray(customersRes) ? customersRes : [];
      const showList = Array.isArray(showsRes) ? showsRes : [];

      setCustomers(customerList);
      setShows(showList);

      // Preselect customer if only 1 exists or if passed in query
      if (queryCustomerId) {
        setSelectedCustomerId(queryCustomerId);
      } else if (customerList.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(String(customerList[0].customerId));
      }

      // Preselect show if passed in query
      if (queryShowId) {
        setSelectedShowId(queryShowId);
      } else if (queryMovieId) {
        const matchingShow = showList.find(
          (s) => s.movie && Number(s.movie.movieId) === Number(queryMovieId)
        );
        if (matchingShow) setSelectedShowId(String(matchingShow.showId));
      } else if (showList.length > 0 && !selectedShowId) {
        setSelectedShowId(String(showList[0].showId));
      }
    } catch (err) {
      console.error('Error fetching booking prerequisites:', err);
      setError({
        message: err.message || 'Unable to connect to the backend booking service.',
        endpoint: 'GET /customers and /shows',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingPrerequisites();
  }, []);

  // Selected Show Object
  const selectedShow = useMemo(() => {
    return shows.find((s) => String(s.showId) === String(selectedShowId)) || null;
  }, [shows, selectedShowId]);

  // Selected Customer Object
  const selectedCustomer = useMemo(() => {
    return (
      customers.find((c) => String(c.customerId) === String(selectedCustomerId)) || null
    );
  }, [customers, selectedCustomerId]);

  // Calculated Estimated Total
  const estimatedTotal = useMemo(() => {
    if (!selectedShow) return 0;
    return Number(selectedShow.ticketPrice || 0) * Number(seatsBooked || 0);
  }, [selectedShow, seatsBooked]);

  const maxAvailableSeats = selectedShow?.availableSeats || 0;
  const isShowSoldOut = maxAvailableSeats <= 0;

  // Handle Quick Customer Registration
  const handleQuickCreateCustomer = async (formData) => {
    setIsAddingCustomer(true);
    try {
      const created = await customerService.createCustomer(formData);
      addToast(`Customer "${created.name}" registered successfully!`, 'success');
      setCustomers((prev) => [...prev, created]);
      setSelectedCustomerId(String(created.customerId));
      setIsAddCustomerOpen(false);
    } catch (err) {
      console.error('Failed to create customer:', err);
      addToast(err.message || 'Failed to register customer', 'error');
    } finally {
      setIsAddingCustomer(false);
    }
  };

  // Form Submit Handler
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Frontend Validations
    if (!selectedCustomerId) {
      setValidationError('Please select a customer for this reservation.');
      return;
    }

    if (!selectedShowId || !selectedShow) {
      setValidationError('Please select a movie showtime to book seats.');
      return;
    }

    const seats = parseInt(seatsBooked, 10);
    if (isNaN(seats) || seats < 1) {
      setValidationError('Please select at least 1 seat to book.');
      return;
    }

    if (seats > maxAvailableSeats) {
      setValidationError(
        `Cannot book ${seats} seats. Only ${maxAvailableSeats} seats are currently available for this show.`
      );
      return;
    }

    // Prepare exact payload required by Spring Boot backend:
    // { customer: { customerId: <id> }, show: { showId: <id> }, seatsBooked: <number> }
    const bookingPayload = {
      customer: {
        customerId: Number(selectedCustomerId),
      },
      show: {
        showId: Number(selectedShowId),
      },
      seatsBooked: seats,
    };

    setIsSubmitting(true);
    try {
      const result = await bookingService.createBooking(bookingPayload);
      addToast('Ticket booking confirmed successfully!', 'success');
      setConfirmedBooking(result);
      setIsConfirmationOpen(true);

      // Refresh shows to reflect updated available seats in backend inventory
      const updatedShows = await showService.getAllShows();
      setShows(Array.isArray(updatedShows) ? updatedShows : []);
    } catch (err) {
      console.error('Booking submission failed:', err);
      const errMsg =
        err.message ||
        'Booking transaction failed. Please ensure the show has sufficient seats.';
      setValidationError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const visuals = selectedShow?.movie
    ? getMovieVisuals(selectedShow.movie.title, selectedShow.movie.genre)
    : null;

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="section-header">
        <div className="section-title-wrap">
          <span className="section-subtitle">Real-time Ticket Reservation</span>
          <h1 className="section-title">
            <Ticket size={32} color="var(--accent-red)" />
            <span>Book Movie Tickets</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Select your customer profile, choose an active showtime, and reserve your seats with immediate database execution.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Preparing booking options and checking seat inventory..." />
      ) : error ? (
        <ErrorState
          title="Booking Service Unavailable"
          message={error.message}
          endpoint={error.endpoint}
          onRetry={fetchBookingPrerequisites}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1.3fr) minmax(280px, 1fr)',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Form Controls */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <form onSubmit={handleBookingSubmit}>
              {/* 1. Customer Selection */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <User size={16} color="var(--accent-cyan)" />
                    <span>Select Customer *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddCustomerOpen(true)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                  >
                    <Plus size={13} />
                    <span>New Customer</span>
                  </button>
                </div>

                {customers.length === 0 ? (
                  <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '0.88rem' }}>
                    No customers registered. Please click "New Customer" above to register.
                  </div>
                ) : (
                  <select
                    className="form-select"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Registered Customer --</option>
                    {customers.map((c) => (
                      <option key={c.customerId} value={c.customerId}>
                        {c.name} ({c.phone || c.email || `ID #${c.customerId}`})
                      </option>
                    ))}
                  </select>
                )}

                {selectedCustomer && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                    <span>Email: <strong>{selectedCustomer.email || 'N/A'}</strong></span>
                    <span>Phone: <strong>{selectedCustomer.phone || 'N/A'}</strong></span>
                  </div>
                )}
              </div>

              {/* 2. Show Selection */}
              <div style={{ marginBottom: '2rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Film size={16} color="var(--accent-red)" />
                  <span>Select Scheduled Show *</span>
                </label>

                {shows.length === 0 ? (
                  <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '0.88rem' }}>
                    No shows currently available in the database.
                  </div>
                ) : (
                  <select
                    className="form-select"
                    value={selectedShowId}
                    onChange={(e) => {
                      setSelectedShowId(e.target.value);
                      setSeatsBooked(1);
                    }}
                    required
                  >
                    <option value="">-- Select Movie, Theatre & Showtime --</option>
                    {shows.map((show) => {
                      const isFull = show.availableSeats <= 0;
                      return (
                        <option
                          key={show.showId}
                          value={show.showId}
                          disabled={isFull}
                        >
                          {show.movie?.title} — {show.theatre?.name} ({show.showDate} {show.showTime}) [₹{show.ticketPrice}] — {isFull ? 'SOLD OUT' : `${show.availableSeats} seats left`}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* 3. Number of Seats Selection */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Armchair size={16} color="var(--accent-gold)" />
                    <span>Number of Seats *</span>
                  </label>
                  <span style={{ fontSize: '0.82rem', color: isShowSoldOut ? '#ef4444' : 'var(--text-muted)' }}>
                    {selectedShow ? (
                      isShowSoldOut ? (
                        <strong>Show is Sold Out</strong>
                      ) : (
                        <span>Available: <strong>{maxAvailableSeats}</strong> seats</span>
                      )
                    ) : (
                      'Select a show first'
                    )}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: '42px', height: '42px', padding: 0, fontSize: '1.25rem' }}
                    onClick={() => setSeatsBooked((prev) => Math.max(1, prev - 1))}
                    disabled={seatsBooked <= 1 || isShowSoldOut}
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min="1"
                    max={maxAvailableSeats > 0 ? maxAvailableSeats : 1}
                    className="form-input"
                    style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, width: '100px' }}
                    value={seatsBooked}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setSeatsBooked(val);
                    }}
                    disabled={isShowSoldOut || !selectedShow}
                  />

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: '42px', height: '42px', padding: 0, fontSize: '1.25rem' }}
                    onClick={() => setSeatsBooked((prev) => Math.min(maxAvailableSeats, prev + 1))}
                    disabled={seatsBooked >= maxAvailableSeats || isShowSoldOut}
                  >
                    +
                  </button>

                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`btn btn-sm ${seatsBooked === preset ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)' }}
                        onClick={() => setSeatsBooked(preset)}
                        disabled={preset > maxAvailableSeats || isShowSoldOut}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Validation Warning */}
              {validationError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.85rem 1rem',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: '#fca5a5',
                    fontSize: '0.88rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', gap: '0.75rem' }}
                disabled={isSubmitting || isShowSoldOut || !selectedShow || !selectedCustomerId}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="spin-icon" />
                    <span>Processing Reservation with Backend...</span>
                  </>
                ) : (
                  <>
                    <Ticket size={20} />
                    <span>
                      Confirm & Book {seatsBooked} {seatsBooked === 1 ? 'Seat' : 'Seats'} (₹{estimatedTotal.toFixed(0)})
                    </span>
                  </>
                )}
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  marginTop: '1.25rem',
                  color: 'var(--text-dim)',
                  fontSize: '0.78rem',
                  lineHeight: '1.45',
                }}
              >
                <ShieldCheck size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  The backend MySQL stored procedure, function, and trigger handle the seat verification, inventory deduction, and final amount calculation.
                </span>
              </div>
            </form>
          </div>

          {/* Right Column: Live Booking Summary Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #161e33 0%, #101524 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              position: 'sticky',
              top: '90px',
            }}
          >
            {/* Visual Header */}
            {visuals && (
              <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                <img
                  src={visuals.backdrop}
                  alt={selectedShow?.movie?.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(180deg, transparent 0%, #161e33 100%)',
                  }}
                />
                <div style={{ position: 'absolute', bottom: '1rem', left: '1.5rem', zIndex: 2 }}>
                  <span className="badge badge-red" style={{ marginBottom: '0.35rem' }}>
                    {selectedShow?.movie?.genre}
                  </span>
                  <h3 style={{ fontSize: '1.35rem', color: '#ffffff' }}>
                    {selectedShow?.movie?.title}
                  </h3>
                </div>
              </div>
            )}

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <h4 style={{ color: '#ffffff', fontSize: '1.1rem' }}>Order Summary</h4>
                <span className="badge badge-gold">Live Verification</span>
              </div>

              {selectedShow ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Cinema Hall:</span>
                    <strong style={{ color: '#ffffff', textAlign: 'right' }}>
                      {selectedShow.theatre?.name}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                    <span style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>
                      {selectedShow.theatre?.location}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Show Date:</span>
                    <strong style={{ color: '#ffffff' }}>{selectedShow.showDate}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Show Time:</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{selectedShow.showTime}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Ticket Price:</span>
                    <span style={{ color: '#ffffff' }}>
                      ₹{Number(selectedShow.ticketPrice).toFixed(0)} / seat
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Selected Seats:</span>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                      {seatsBooked} {seatsBooked === 1 ? 'Seat' : 'Seats'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                    <span style={{ color: '#ffffff' }}>
                      {selectedCustomer?.name || 'Not Selected'}
                    </span>
                  </div>

                  {/* Perforated divider */}
                  <div
                    style={{
                      borderTop: '2px dashed rgba(255, 255, 255, 0.15)',
                      margin: '0.5rem 0',
                    }}
                  />

                  {/* Total Calculation */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                        Estimated Payable
                      </span>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
                        ₹{estimatedTotal.toFixed(2)}
                      </div>
                    </div>

                    <span className="badge badge-emerald">GST Included</span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Film size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p style={{ fontSize: '0.9rem' }}>
                    Select a movie show from the list to preview pricing and summary details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Showing Actual Backend Response */}
      <BookingConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        booking={confirmedBooking}
      />

      {/* Quick Add Customer Modal */}
      <CustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSave={handleQuickCreateCustomer}
        isSubmitting={isAddingCustomer}
      />
    </div>
  );
};

export default Booking;
