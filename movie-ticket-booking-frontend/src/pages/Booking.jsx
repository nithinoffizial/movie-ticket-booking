import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Ticket,
  AlertCircle,
  Plus,
  ChevronDown,
} from 'lucide-react';
import customerService from '../services/customerService';
import showService from '../services/showService';
import seatService from '../services/seatService';
import bookingService from '../services/bookingService';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import DigitalTicketModal from '../components/tickets/DigitalTicketModal';
import CustomerModal from '../components/customers/CustomerModal';
import SeatGrid from '../components/seats/SeatGrid';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isAuthenticated, user, isAdmin } = useAuth();

  const queryShowId = searchParams.get('showId');
  const queryMovieId = searchParams.get('movieId');
  const queryCustomerId = searchParams.get('customerId');

  // Core Data
  const [customers, setCustomers] = useState([]);
  const [shows, setShows] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [error, setError] = useState(null);

  // Form Selections
  const [selectedCustomerId, setSelectedCustomerId] = useState(queryCustomerId || '');
  const [selectedShowId, setSelectedShowId] = useState(queryShowId || '');
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Submission & Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Quick Add Customer Modal (for admin)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  // Validation feedback
  const [validationError, setValidationError] = useState('');

  const fetchSeatsForShow = useCallback(async (showIdToFetch) => {
    if (!showIdToFetch) return;
    setLoadingSeats(true);
    setSelectedSeats([]);
    try {
      const data = await seatService.getSeatsByShowId(showIdToFetch);
      setSeats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load seats for show:', err);
      addToast('Could not load cinema seats for this show.', 'error');
    } finally {
      setLoadingSeats(false);
    }
  }, [addToast]);

  // Fetch Customers & Shows
  const fetchBookingPrerequisites = useCallback(async () => {
    try {
      let customerList = [];
      if (isAdmin) {
        try {
          const res = await customerService.getAllCustomers();
          customerList = Array.isArray(res) ? res : [];
          setCustomers(customerList);
        } catch (e) {
          console.warn('Could not fetch all customers:', e);
        }
      }

      const showsRes = await showService.getAllShows();
      const showList = Array.isArray(showsRes) ? showsRes : [];
      setShows(showList);

      if (isAdmin) {
        if (queryCustomerId) {
          setSelectedCustomerId(queryCustomerId);
        } else if (customerList.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(String(customerList[0].customerId));
        }
      } else if (user?.customerId) {
        setSelectedCustomerId(String(user.customerId));
      }

      let initialShowId = '';
      if (queryShowId) {
        initialShowId = queryShowId;
      } else if (queryMovieId) {
        const matchingShow = showList.find(
          (s) => s.movie && Number(s.movie.movieId) === Number(queryMovieId)
        );
        if (matchingShow) initialShowId = String(matchingShow.showId);
      } else if (showList.length > 0) {
        initialShowId = String(showList[0].showId);
      }

      if (initialShowId) {
        setSelectedShowId(initialShowId);
        fetchSeatsForShow(initialShowId);
      }
    } catch (err) {
      console.error('Error fetching booking prerequisites:', err);
      setError({
        message: err.message || 'Unable to connect to the backend booking service.',
        endpoint: 'GET /shows',
      });
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user, queryCustomerId, queryShowId, queryMovieId, selectedCustomerId, fetchSeatsForShow]);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        let customerList = [];
        if (isAdmin) {
          try {
            const res = await customerService.getAllCustomers();
            customerList = Array.isArray(res) ? res : [];
            if (active) setCustomers(customerList);
          } catch (e) {
            console.warn('Could not fetch all customers:', e);
          }
        }

        const showsRes = await showService.getAllShows();
        const showList = Array.isArray(showsRes) ? showsRes : [];
        if (active) setShows(showList);

        if (isAdmin) {
          if (queryCustomerId) {
            if (active) setSelectedCustomerId(queryCustomerId);
          } else if (customerList.length > 0 && !selectedCustomerId) {
            if (active) setSelectedCustomerId(String(customerList[0].customerId));
          }
        } else if (user?.customerId) {
          if (active) setSelectedCustomerId(String(user.customerId));
        }

        let initialShowId = '';
        if (queryShowId) {
          initialShowId = queryShowId;
        } else if (queryMovieId) {
          const matchingShow = showList.find(
            (s) => s.movie && Number(s.movie.movieId) === Number(queryMovieId)
          );
          if (matchingShow) initialShowId = String(matchingShow.showId);
        } else if (showList.length > 0) {
          initialShowId = String(showList[0].showId);
        }

        if (initialShowId && active) {
          setSelectedShowId(initialShowId);
          fetchSeatsForShow(initialShowId);
        }
      } catch (err) {
        if (active) {
          console.error('Error fetching booking prerequisites:', err);
          setError({
            message: err.message || 'Unable to connect to the backend booking service.',
            endpoint: 'GET /shows',
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [isAdmin, user, queryCustomerId, queryShowId, queryMovieId, selectedCustomerId, fetchSeatsForShow]);

  const handleShowChange = (e) => {
    const newShowId = e.target.value;
    setSelectedShowId(newShowId);
    setValidationError('');
    fetchSeatsForShow(newShowId);
  };

  const handleToggleSeat = (seatNumber) => {
    setValidationError('');
    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        return prev.filter((s) => s !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  // Selected Show Object
  const selectedShow = useMemo(() => {
    return shows.find((s) => String(s.showId) === String(selectedShowId)) || null;
  }, [shows, selectedShowId]);

  // Handle Quick Customer Registration (admin only)
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

    if (!isAuthenticated) {
      addToast('Please log in to complete your ticket reservation.', 'info');
      navigate('/login', { state: { from: { pathname: '/booking' } } });
      return;
    }

    if (!selectedShowId || !selectedShow) {
      setValidationError('Please select a movie showtime to book seats.');
      return;
    }

    if (selectedSeats.length === 0) {
      setValidationError('Please select at least 1 seat from the cinema layout below.');
      return;
    }

    const bookingPayload = {
      showId: Number(selectedShowId),
      seatNumbers: selectedSeats,
    };

    if (isAdmin && selectedCustomerId) {
      bookingPayload.customerId = Number(selectedCustomerId);
    }

    setIsSubmitting(true);
    try {
      const result = await bookingService.createBooking(bookingPayload);
      addToast('Ticket booking confirmed successfully!', 'success');
      setConfirmedTicket(result);
      setIsTicketModalOpen(true);
      setSelectedSeats([]);

      // Refresh seats and show details
      fetchSeatsForShow(selectedShowId);
      const updatedShows = await showService.getAllShows();
      setShows(Array.isArray(updatedShows) ? updatedShows : []);
    } catch (err) {
      console.error('Booking submission failed:', err);
      const errMsg =
        err.message ||
        'Booking transaction failed. Please ensure the selected seats are still available.';
      setValidationError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Select an active showtime, choose your seats using the graphical cinema layout, and receive your digital ticket pass.
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
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Top Form Controls Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              marginBottom: '2rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr', gap: '1.5rem', alignItems: 'flex-end' }}>
              {/* Show Selection Dropdown */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="showSelect">
                  Select Movie & Showtime
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="showSelect"
                    className="form-input form-select"
                    value={selectedShowId}
                    onChange={handleShowChange}
                    style={{ paddingRight: '2.5rem' }}
                  >
                    {shows.map((s) => (
                      <option key={s.showId} value={s.showId}>
                        {s.movie?.title} — {s.theatre?.name} ({s.showDate} {s.showTime}) — ₹{s.ticketPrice} ({s.availableSeats} seats left)
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: 'var(--text-dim)',
                    }}
                  />
                </div>
              </div>

              {/* Customer Dropdown (Visible only to Admin) */}
              {isAdmin && (
                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label className="form-label" htmlFor="customerSelect" style={{ margin: 0 }}>
                      Assign to Customer
                    </label>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsAddCustomerOpen(true)}
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    >
                      <Plus size={12} />
                      <span>New Customer</span>
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="customerSelect"
                      className="form-input form-select"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                      {customers.map((c) => (
                        <option key={c.customerId} value={c.customerId}>
                          {c.name} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Validation Error Alert */}
            {validationError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  marginTop: '1.25rem',
                  color: '#f87171',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={18} />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Graphical Cinema Seat Selection Section */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem 1.5rem',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '2rem',
            }}
          >
            {loadingSeats ? (
              <LoadingState message="Loading cinema seat layout..." />
            ) : selectedShow ? (
              <>
                <SeatGrid
                  seats={seats}
                  selectedSeats={selectedSeats}
                  onToggleSeat={handleToggleSeat}
                  ticketPrice={selectedShow.ticketPrice}
                />

                {/* Final Submit Button */}
                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={handleBookingSubmit}
                    disabled={isSubmitting || selectedSeats.length === 0}
                    style={{
                      padding: '0.85rem clamp(1.25rem, 4vw, 3rem)',
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
                      {isSubmitting
                        ? 'Confirming Database Booking...'
                        : selectedSeats.length > 0
                        ? `Book ${selectedSeats.length} Selected Seat${selectedSeats.length > 1 ? 's' : ''} (₹${(selectedSeats.length * selectedShow.ticketPrice).toFixed(2)})`
                        : 'Select Seats Above to Book'}
                    </span>
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Confirmed Digital Ticket Modal */}
      <DigitalTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false);
          navigate('/my-bookings');
        }}
        ticket={confirmedTicket}
      />

      {/* Quick Add Customer Modal (for Admin) */}
      <CustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSubmit={handleQuickCreateCustomer}
        loading={isAddingCustomer}
      />
    </div>
  );
};

export default Booking;
