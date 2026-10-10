import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import showService from '../services/showService';
import seatService from '../services/seatService';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import DigitalTicketModal from '../components/tickets/DigitalTicketModal';
import SeatGrid from '../components/seats/SeatGrid';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Film,
  Building2,
  Calendar,
  Ticket,
  TrendingUp,
  Shield,
  Eye,
  ChevronDown,
  AlertTriangle,
  UserCheck,
  UserX,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // If ?tab=support is accessed, cleanly redirect to dedicated support page
  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam === 'support') {
      navigate('/admin/support', { replace: true });
    }
  }, [location.search, navigate]);

  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = new URLSearchParams(window.location.search).get('tab');
    if (tabParam && ['bookings', 'tickets', 'seats', 'customers'].includes(tabParam)) {
      return tabParam;
    }
    return 'bookings';
  });
  const [allBookings, setAllBookings] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [allShows, setAllShows] = useState([]);

  // Seat Availability Inspector state
  const [inspectorShowId, setInspectorShowId] = useState('');
  const [inspectorSeats, setInspectorSeats] = useState([]);
  const [inspectorLoading, setInspectorLoading] = useState(false);

  // Digital Ticket Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Customer status management
  const [customerToDeactivate, setCustomerToDeactivate] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { addToast } = useToast();
  const { user } = useAuth();

  const loadInspectorSeats = React.useCallback(async (showId) => {
    if (!showId) return;
    setInspectorLoading(true);
    try {
      const seatsData = await seatService.getSeatsByShowId(showId);
      setInspectorSeats(Array.isArray(seatsData) ? seatsData : []);
    } catch (err) {
      console.error('Failed to load inspector seats:', err);
    } finally {
      setInspectorLoading(false);
    }
  }, []);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      const [statsData, bookingsData, ticketsData, customersData, showsData] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAllBookings(),
        adminService.getAllTickets(),
        adminService.getAllCustomers(),
        showService.getAllShows(),
      ]);

      setStats(statsData);
      setAllBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setAllTickets(Array.isArray(ticketsData) ? ticketsData : []);
      setAllCustomers(Array.isArray(customersData) ? customersData : []);
      const showList = Array.isArray(showsData) ? showsData : [];
      setAllShows(showList);

      if (showList.length > 0 && !inspectorShowId) {
        setInspectorShowId(String(showList[0].showId));
        loadInspectorSeats(showList[0].showId);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError({
        message: err.message || 'Unable to load administrator dashboard metrics.',
        endpoint: 'GET /admin/dashboard',
      });
    } finally {
      setLoading(false);
    }
  }, [inspectorShowId, loadInspectorSeats]);

  useEffect(() => {
    let active = true;
    Promise.all([
      adminService.getDashboard(),
      adminService.getAllBookings(),
      adminService.getAllTickets(),
      adminService.getAllCustomers(),
      showService.getAllShows(),
    ]).then(([statsData, bookingsData, ticketsData, customersData, showsData]) => {
      if (active) {
        setStats(statsData);
        setAllBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setAllTickets(Array.isArray(ticketsData) ? ticketsData : []);
        setAllCustomers(Array.isArray(customersData) ? customersData : []);
        const showList = Array.isArray(showsData) ? showsData : [];
        setAllShows(showList);
        if (showList.length > 0) {
          setInspectorShowId(String(showList[0].showId));
          loadInspectorSeats(showList[0].showId);
        }
      }
    }).catch((err) => {
      if (active) {
        console.error('Failed to load admin dashboard:', err);
        setError({
          message: err.message || 'Unable to load administrator dashboard metrics.',
          endpoint: 'GET /admin/dashboard',
        });
      }
    }).finally(() => {
      if (active) {
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [loadInspectorSeats]);

  const handleInspectorShowChange = (e) => {
    const sId = e.target.value;
    setInspectorShowId(sId);
    loadInspectorSeats(sId);
  };

  const handleViewTicketFromBooking = (booking) => {
    const match = allTickets.find((t) => t.bookingId === booking.bookingId);
    if (match) {
      setSelectedTicket(match);
    } else {
      setSelectedTicket({
        ticketNumber: booking.ticketNumber,
        customer: booking.customerName,
        customerEmail: booking.customerEmail,
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
      });
    }
    setIsTicketModalOpen(true);
  };

  const handleToggleCustomerStatus = async (customer) => {
    if (customer.active !== false) {
      if (user?.customerId && user.customerId === customer.customerId) {
        addToast('You cannot deactivate your own administrator account.', 'error');
        return;
      }
      setCustomerToDeactivate(customer);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await adminService.updateCustomerStatus(customer.customerId, true);
      addToast(`Customer "${customer.name}" reactivated successfully!`, 'success');
      setAllCustomers((prev) =>
        prev.map((c) => (c.customerId === customer.customerId ? { ...c, active: true } : c))
      );
    } catch (err) {
      console.error('Error activating customer:', err);
      addToast(err.message || 'Failed to activate customer.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmDeactivation = async () => {
    if (!customerToDeactivate) return;
    setIsUpdatingStatus(true);
    try {
      await adminService.updateCustomerStatus(customerToDeactivate.customerId, false);
      addToast(`Customer "${customerToDeactivate.name}" deactivated successfully.`, 'success');
      setAllCustomers((prev) =>
        prev.map((c) => (c.customerId === customerToDeactivate.customerId ? { ...c, active: false } : c))
      );
      setCustomerToDeactivate(null);
    } catch (err) {
      console.error('Error deactivating customer:', err);
      addToast(err.message || 'Failed to deactivate customer.', 'error');
    } finally {
      setIsUpdatingStatus(false);
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

  const selectedInspectorShow = allShows.find((s) => String(s.showId) === String(inspectorShowId));

  return (
    <div className="page-wrapper">
      {/* Admin Header */}
      <div className="section-header">
        <div className="section-title-wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
              <Shield size={14} style={{ marginRight: '4px' }} />
              Administrator Control Center
            </span>
          </div>
          <h1 className="section-title" style={{ marginTop: '0.5rem' }}>
            <span>Operations Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Real-time management of customers, theatre screens, shows, database bookings, and revenue metrics.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Aggregating enterprise statistics and records..." />
      ) : error ? (
        <ErrorState
          title="Admin Dashboard Unavailable"
          message={error.message}
          endpoint={error.endpoint}
          onRetry={fetchDashboardData}
        />
      ) : stats ? (
        <div>
          {/* Top 6 KPI Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem',
            }}
          >
            {/* Customers */}
            <div
              className="card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Customers
                </span>
                <Users size={18} color="var(--accent-cyan)" />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {stats.totalCustomers}
              </div>
              <Link to="/customers" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'none', display: 'inline-block', marginTop: '0.4rem' }}>
                Manage Directory →
              </Link>
            </div>

            {/* Movies */}
            <div
              className="card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Movies
                </span>
                <Film size={18} color="var(--accent-red)" />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {stats.totalMovies}
              </div>
              <Link to="/movies" style={{ fontSize: '0.75rem', color: 'var(--accent-red)', textDecoration: 'none', display: 'inline-block', marginTop: '0.4rem' }}>
                Manage Movies →
              </Link>
            </div>

            {/* Theatres */}
            <div
              className="card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Theatres
                </span>
                <Building2 size={18} color="var(--accent-purple)" />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {stats.totalTheatres}
              </div>
              <Link to="/theatres" style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', textDecoration: 'none', display: 'inline-block', marginTop: '0.4rem' }}>
                Manage Theatres →
              </Link>
            </div>

            {/* Shows */}
            <div
              className="card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Shows
                </span>
                <Calendar size={18} color="var(--accent-emerald)" />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {stats.totalShows}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'inline-block', marginTop: '0.4rem' }}>
                Active Screenings
              </span>
            </div>

            {/* Bookings */}
            <div
              className="card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Bookings
                </span>
                <Ticket size={18} color="#38bdf8" />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {stats.totalBookings}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'inline-block', marginTop: '0.4rem' }}>
                Confirmed Orders
              </span>
            </div>

            {/* Total Revenue */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, var(--bg-card) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Revenue
                </span>
                <TrendingUp size={18} color="var(--accent-gold)" />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                ₹{Number(stats.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'inline-block', marginTop: '0.4rem' }}>
                Database Verified
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '1.75rem',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <button
              type="button"
              className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
              style={{ padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              All Bookings ({allBookings.length})
            </button>
            <button
              type="button"
              className={`nav-link ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
              style={{ padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              All Digital Tickets ({allTickets.length})
            </button>
            <button
              type="button"
              className={`nav-link ${activeTab === 'seats' ? 'active' : ''}`}
              onClick={() => setActiveTab('seats')}
              style={{ padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Seat Availability Inspector
            </button>
            <button
              type="button"
              className={`nav-link ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
              style={{ padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              All Customers ({allCustomers.length})
            </button>
          </div>

          {/* Tab 1: Bookings Management */}
          {activeTab === 'bookings' && (
            <div
              className="card"
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
              }}
            >
              <div className="table-responsive">
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '680px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '1rem' }}>ID & Ticket</th>
                      <th style={{ padding: '1rem' }}>Customer</th>
                      <th style={{ padding: '1rem' }}>Movie & Theatre</th>
                      <th style={{ padding: '1rem' }}>Selected Seats</th>
                      <th style={{ padding: '1rem' }}>Amount</th>
                      <th style={{ padding: '1rem' }}>Booking Date</th>
                      <th style={{ padding: '1rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.map((b) => (
                      <tr key={b.bookingId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>#{b.bookingId}</div>
                          <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#38bdf8' }}>
                            {b.ticketNumber || 'TKT-PENDING'}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.customerName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{b.customerEmail}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.movie}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {b.theatre} • {b.showDate}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {Array.isArray(b.seats) && b.seats.length > 0 ? (
                              b.seats.map((s) => (
                                <span
                                  key={s}
                                  style={{
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    color: 'var(--seat-selected)',
                                    border: '1px solid rgba(16, 185, 129, 0.35)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    padding: '0.1rem 0.45rem',
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
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                            ₹{Number(b.totalAmount).toFixed(2)}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {formatDate(b.bookingDate)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleViewTicketFromBooking(b)}
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                          >
                            <Eye size={14} />
                            <span>Ticket</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Digital Tickets Management */}
          {activeTab === 'tickets' && (
            <div
              className="card"
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
              }}
            >
              <div className="table-responsive">
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '680px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '1rem' }}>Ticket Number</th>
                      <th style={{ padding: '1rem' }}>Customer</th>
                      <th style={{ padding: '1rem' }}>Movie & Theatre</th>
                      <th style={{ padding: '1rem' }}>Schedule</th>
                      <th style={{ padding: '1rem' }}>Seats</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                      <th style={{ padding: '1rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTickets.map((t) => (
                      <tr key={t.ticketId || t.ticketNumber} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>
                            {t.ticketNumber}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.customer}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{t.customerEmail}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.movie}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.theatre}</div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <div>{formatDate(t.showDate)}</div>
                          <div style={{ color: 'var(--text-dim)' }}>{t.showTime}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {Array.isArray(t.seats) ? t.seats.map((s) => (
                              <span key={s} style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--seat-selected)', border: '1px solid rgba(16, 185, 129, 0.35)', fontSize: '0.75rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                                {s}
                              </span>
                            )) : 'N/A'}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                            {t.status || 'CONFIRMED'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedTicket(t);
                              setIsTicketModalOpen(true);
                            }}
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                          >
                            <Eye size={14} />
                            <span>View Pass</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Seat Availability Inspector */}
          {activeTab === 'seats' && (
            <div
              className="card"
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                padding: '2rem',
              }}
            >
              {/* Show Selector */}
              <div style={{ maxWidth: '600px', marginBottom: '2rem' }}>
                <label className="form-label" htmlFor="inspectorShow">
                  Select Show to Inspect Seat Availability
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="inspectorShow"
                    className="form-input form-select"
                    value={inspectorShowId}
                    onChange={handleInspectorShowChange}
                  >
                    {allShows.map((s) => (
                      <option key={s.showId} value={s.showId}>
                        {s.movie?.title} — {s.theatre?.name} ({s.showDate} {s.showTime}) — {s.availableSeats} / {s.totalSeats} seats available
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

              {/* Show Stats Details */}
              {selectedInspectorShow && (
                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '2rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Movie</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedInspectorShow.movie?.title}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Theatre & Screen</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedInspectorShow.theatre?.name}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ticket Price</span>
                    <div style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>₹{selectedInspectorShow.ticketPrice}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Seats</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedInspectorShow.totalSeats}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available Seats</span>
                    <div style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{selectedInspectorShow.availableSeats}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Booked Seats</span>
                    <div style={{ fontWeight: 700, color: '#ef4444' }}>
                      {selectedInspectorShow.totalSeats - selectedInspectorShow.availableSeats}
                    </div>
                  </div>
                </div>
              )}

              {/* Graphical Cinema Seat Layout */}
              {inspectorLoading ? (
                <LoadingState message="Loading cinema seat layout..." />
              ) : (
                <SeatGrid
                  seats={inspectorSeats}
                  selectedSeats={[]}
                  onToggleSeat={() => {}}
                  ticketPrice={selectedInspectorShow?.ticketPrice || 0}
                />
              )}
            </div>
          )}

          {/* Tab 4: Customers Directory */}
          {activeTab === 'customers' && (
            <div
              className="card"
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
              }}
            >
              <div className="table-responsive">
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '1rem' }}>Customer</th>
                      <th style={{ padding: '1rem' }}>Email</th>
                      <th style={{ padding: '1rem' }}>Phone</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                      <th style={{ padding: '1rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCustomers.map((c) => (
                      <tr key={c.customerId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>#{c.customerId}</div>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                          {c.email}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                          {c.phone || 'N/A'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.25rem 0.65rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              background: c.active !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: c.active !== false ? 'var(--accent-emerald)' : '#f87171',
                              border: `1px solid ${c.active !== false ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: c.active !== false ? 'var(--accent-emerald)' : '#f87171',
                              }}
                            />
                            {c.active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {c.active !== false ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{
                                borderColor: 'rgba(239, 68, 68, 0.4)',
                                color: '#f87171',
                                padding: '0.35rem 0.75rem',
                                fontSize: '0.8rem',
                              }}
                              onClick={() => handleToggleCustomerStatus(c)}
                              disabled={isUpdatingStatus}
                            >
                              <UserX size={14} />
                              <span>Deactivate</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{
                                borderColor: 'rgba(16, 185, 129, 0.4)',
                                color: 'var(--accent-emerald)',
                                padding: '0.35rem 0.75rem',
                                fontSize: '0.8rem',
                              }}
                              onClick={() => handleToggleCustomerStatus(c)}
                              disabled={isUpdatingStatus}
                            >
                              <UserCheck size={14} />
                              <span>Activate</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Digital Ticket Modal */}
      <DigitalTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        ticket={selectedTicket}
      />

      {/* Deactivate Customer Confirmation Modal */}
      <Modal
        isOpen={!!customerToDeactivate}
        onClose={() => setCustomerToDeactivate(null)}
        title="Confirm Customer Deactivation"
        maxWidth="460px"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <AlertTriangle size={28} />
          </div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Deactivate {customerToDeactivate?.name}?
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Are you sure you want to deactivate customer account #{customerToDeactivate?.customerId}?
            They will be prevented from logging in and booking tickets.
            Their existing bookings and tickets will remain intact.
          </p>
        </div>

        <div className="modal-footer" style={{ padding: '1rem 0 0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setCustomerToDeactivate(null)}
            disabled={isUpdatingStatus}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleConfirmDeactivation}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? 'Deactivating...' : 'Confirm Deactivate'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
