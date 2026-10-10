import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import supportService from '../services/supportService';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import Modal from '../components/common/Modal';
import {
  LifeBuoy,
  MessageSquare,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  XCircle,
  Shield,
  FileQuestion,
  Search,
  LogIn,
  UserPlus,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'BOOKING_ISSUE', label: 'Booking Issue', description: 'Problems with seat reservation or booking status' },
  { value: 'PAYMENT_ISSUE', label: 'Payment Issue', description: 'Transaction failures, double charges, or invoice issues' },
  { value: 'TICKET_ISSUE', label: 'Ticket Issue', description: 'Digital ticket pass generation or QR code display' },
  { value: 'SEAT_SELECTION', label: 'Seat Selection', description: 'Questions or issues regarding cinema seating arrangement' },
  { value: 'CANCELLATION_REFUND', label: 'Cancellation & Refund', description: 'Requesting booking cancellation or refund status' },
  { value: 'ACCOUNT_ISSUE', label: 'Account Issue', description: 'Profile, login, or credentials assistance' },
  { value: 'OTHER', label: 'Other', description: 'General questions, cinema feedback, or special inquiries' },
];

const STATUS_CONFIG = {
  OPEN: {
    label: 'Open',
    bg: 'rgba(56, 189, 248, 0.15)',
    color: '#38bdf8',
    border: 'rgba(56, 189, 248, 0.35)',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'rgba(245, 158, 11, 0.15)',
    color: '#fbbf24',
    border: 'rgba(245, 158, 11, 0.35)',
  },
  WAITING_FOR_CUSTOMER: {
    label: 'Waiting for Customer',
    bg: 'rgba(168, 85, 247, 0.15)',
    color: '#c084fc',
    border: 'rgba(168, 85, 247, 0.35)',
  },
  RESOLVED: {
    label: 'Resolved',
    bg: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    border: 'rgba(16, 185, 129, 0.35)',
  },
  CLOSED: {
    label: 'Closed',
    bg: 'rgba(148, 163, 184, 0.15)',
    color: '#94a3b8',
    border: 'rgba(148, 163, 184, 0.3)',
  },
};

const Support = () => {
  const { isAuthenticated, isCustomer, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'new'
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [errorTickets, setErrorTickets] = useState(null);

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Ticket Conversation Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Close Confirmation Modal State
  const [ticketToClose, setTicketToClose] = useState(null);
  const [isClosingTicket, setIsClosingTicket] = useState(false);

  // Submission Form State
  const [formCategory, setFormCategory] = useState('BOOKING_ISSUE');
  const [formSubject, setFormSubject] = useState('');
  const [formBookingRef, setFormBookingRef] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const fetchTickets = React.useCallback(async () => {
    if (!isAuthenticated || !isCustomer) return;
    setLoadingTickets(true);
    setErrorTickets(null);
    try {
      const data = await supportService.getMyTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
      setErrorTickets(err.message || 'Unable to load your support tickets.');
    } finally {
      setLoadingTickets(false);
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => {
    let active = true;
    if (isAuthenticated && isCustomer) {
      supportService.getMyTickets()
        .then((data) => {
          if (active) setTickets(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (active) {
            console.error('Failed to fetch support tickets:', err);
            setErrorTickets(err.message || 'Unable to load your support tickets.');
          }
        })
        .finally(() => {
          if (active) setLoadingTickets(false);
        });
    }
    return () => {
      active = false;
    };
  }, [isAuthenticated, isCustomer]);

  // Open ticket details in conversation view
  const handleOpenConversation = async (ticket) => {
    setSelectedTicket(ticket);
    setReplyText('');
    setLoadingDetail(true);
    try {
      const detail = await supportService.getTicketDetail(ticket.ticketId);
      setSelectedTicket(detail);
    } catch (err) {
      console.error('Failed to load ticket conversation:', err);
      addToast(err.message || 'Failed to load conversation details.', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Submit reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      addToast('Please type a reply message before submitting.', 'error');
      return;
    }

    if (selectedTicket.status === 'CLOSED') {
      addToast('This ticket is closed and cannot receive replies. Please create a new ticket.', 'error');
      return;
    }

    setIsSubmittingReply(true);
    try {
      const updated = await supportService.replyToTicket(selectedTicket.ticketId, replyText.trim());
      addToast('Reply sent successfully!', 'success');
      setSelectedTicket(updated);
      setReplyText('');
      // Update local ticket list
      setTickets((prev) =>
        prev.map((t) => (t.ticketId === updated.ticketId ? updated : t))
      );
    } catch (err) {
      console.error('Failed to send reply:', err);
      addToast(err.message || 'Failed to send reply.', 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Customer closes ticket
  const handleConfirmCloseTicket = async () => {
    if (!ticketToClose) return;
    setIsClosingTicket(true);
    try {
      const updated = await supportService.closeTicket(ticketToClose.ticketId);
      addToast(`Ticket ${ticketToClose.ticketReference} closed successfully.`, 'success');
      setTickets((prev) =>
        prev.map((t) => (t.ticketId === updated.ticketId ? updated : t))
      );
      if (selectedTicket && selectedTicket.ticketId === updated.ticketId) {
        setSelectedTicket(updated);
      }
      setTicketToClose(null);
    } catch (err) {
      console.error('Failed to close ticket:', err);
      addToast(err.message || 'Failed to close ticket.', 'error');
    } finally {
      setIsClosingTicket(false);
    }
  };

  // Validate and submit new ticket
  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formSubject.trim()) {
      errors.subject = 'Subject is required.';
    } else if (formSubject.trim().length < 3 || formSubject.trim().length > 200) {
      errors.subject = 'Subject must be between 3 and 200 characters.';
    }

    if (!formMessage.trim()) {
      errors.message = 'Please provide details in the message description.';
    } else if (formMessage.trim().length < 5 || formMessage.trim().length > 4000) {
      errors.message = 'Message must be between 5 and 4000 characters.';
    }

    if (formBookingRef.trim().length > 50) {
      errors.bookingRef = 'Booking reference must not exceed 50 characters.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmittingNew(true);
    try {
      const payload = {
        category: formCategory,
        subject: formSubject.trim(),
        message: formMessage.trim(),
        bookingReference: formBookingRef.trim() || null,
      };

      const created = await supportService.createTicket(payload);
      addToast(`Support ticket ${created.ticketReference} created successfully!`, 'success');

      // Reset form fields
      setFormSubject('');
      setFormBookingRef('');
      setFormMessage('');
      setFormCategory('BOOKING_ISSUE');

      // Add to ticket list
      setTickets((prev) => [created, ...prev]);

      // Open the new ticket conversation view directly
      setSelectedTicket(created);
      setActiveTab('tickets');
    } catch (err) {
      console.error('Ticket submission failed:', err);
      addToast(err.message || 'Failed to create support ticket. Please try again.', 'error');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      t.ticketReference?.toLowerCase().includes(query) ||
      t.subject?.toLowerCase().includes(query) ||
      t.category?.toLowerCase().includes(query) ||
      t.bookingReference?.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });

  // ==========================================
  // RENDER 1: GUEST VIEW
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="page-wrapper" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Support Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(229, 9, 20, 0.15)',
              border: '1px solid rgba(229, 9, 20, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: 'var(--accent-red)',
            }}
          >
            <LifeBuoy size={34} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            CinePass <span style={{ color: 'var(--accent-red)' }}>Customer Support</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '620px', margin: '0 auto' }}>
            We're here to assist with movie ticket reservations, payments, digital passes, and cinema seating.
          </p>
        </div>

        {/* Polished Guest Authentication Prompt Card */}
        <div
          className="card"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(229, 9, 20, 0.3)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
            marginBottom: '3.5rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(229, 9, 20, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(229, 9, 20, 0.12)',
              color: 'var(--accent-red)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={16} />
            <span>Dedicated Cinema Help Desk</span>
          </div>

          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 700 }}>
            Please sign in to submit a support request or view your tickets.
          </h2>

          <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 2rem', fontSize: '1rem' }}>
            Sign in to track real-time resolution updates, submit queries about your bookings, and chat directly with CinePass administrators.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login?redirect=/support" className="btn btn-primary btn-lg" style={{ minWidth: '180px' }}>
              <LogIn size={18} />
              <span>Sign In</span>
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg" style={{ minWidth: '180px' }}>
              <UserPlus size={18} />
              <span>Register Account</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Showcase */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div
            className="card"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
            }}
          >
            <div style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>
              <LifeBuoy size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Instant Ticket Issue Resolution</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Report issues regarding digital tickets, PDF passes, or QR validation codes for fast resolution.
            </p>
          </div>

          <div
            className="card"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
            }}
          >
            <div style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>
              <Clock size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Refunds & Cancellations</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Inquire about payment transactions, processing updates, or show reschedule requests.
            </p>
          </div>

          <div
            className="card"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
            }}
          >
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '1rem' }}>
              <MessageSquare size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Direct Administrator Chat</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Communicate seamlessly in a unified ticket thread with CinePass support representatives.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER 2: ADMINISTRATOR VIEW NOTICE
  // ==========================================
  if (isAdmin) {
    return (
      <div className="page-wrapper" style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--accent-gold)',
          }}
        >
          <Shield size={34} />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Administrator Support Portal
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto 2rem' }}>
          You are currently authenticated as an <strong>Administrator</strong>. All customer support tickets and conversation queues are managed centrally through the Operations Control Desk.
        </p>
        <Link to="/admin/support" className="btn btn-primary btn-lg">
          <Shield size={18} />
          <span>Go to Admin Support Desk</span>
        </Link>
      </div>
    );
  }

  // ==========================================
  // RENDER 3: AUTHENTICATED CUSTOMER VIEW
  // ==========================================
  const openCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'WAITING_FOR_CUSTOMER').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="page-wrapper">
      {/* Header Banner */}
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <div className="section-title-wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(229, 9, 20, 0.15)',
                color: 'var(--accent-red)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              <LifeBuoy size={14} />
              CinePass Help Desk
            </span>
          </div>
          <h1 className="section-title">
            <span>Customer Support</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Submit tickets, track resolution status, and communicate directly with the cinema operations team.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Active Requests</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{openCount}</div>
            </div>
          </div>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-emerald)' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Resolved / Closed</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{resolvedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <button
          type="button"
          className={`nav-link ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
          style={{
            padding: '0.85rem 1.5rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <MessageSquare size={18} />
          <span>My Support Tickets ({tickets.length})</span>
        </button>

        <button
          type="button"
          className={`nav-link ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
          style={{
            padding: '0.85rem 1.5rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <PlusCircle size={18} />
          <span>Submit New Ticket</span>
        </button>
      </div>

      {/* TAB 1: TICKET LIST */}
      {activeTab === 'tickets' && (
        <div>
          {/* Controls Bar: Search & Status Filter */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* Status Filter Badges */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['ALL', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid',
                    borderColor: statusFilter === st ? 'var(--accent-red)' : 'var(--border-subtle)',
                    background: statusFilter === st ? 'rgba(229, 9, 20, 0.15)' : 'var(--bg-card)',
                    color: statusFilter === st ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {st === 'ALL' ? 'All Tickets' : STATUS_CONFIG[st]?.label || st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search reference or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.3rem', fontSize: '0.875rem' }}
              />
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.8rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Tickets View */}
          {loadingTickets ? (
            <LoadingState message="Loading your support tickets..." height="280px" />
          ) : errorTickets ? (
            <ErrorState
              title="Support System Notice"
              message={errorTickets}
              endpoint="GET /api/support/tickets"
              onRetry={fetchTickets}
            />
          ) : filteredTickets.length === 0 ? (
            <div
              className="card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '3.5rem 1.5rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  color: 'var(--text-dim)',
                }}
              >
                <FileQuestion size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {searchQuery || statusFilter !== 'ALL' ? 'No Matching Tickets Found' : 'No Support Tickets Yet'}
              </h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try clearing your search filters to find tickets.'
                  : 'Have a question about a booking, seat reservation, or refund? Create your first ticket now.'}
              </p>
              <button
                type="button"
                className="btn btn-primary btn-md"
                onClick={() => setActiveTab('new')}
              >
                <PlusCircle size={18} />
                <span>Submit a Request</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredTickets.map((t) => {
                const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.OPEN;
                return (
                  <div
                    key={t.ticketId}
                    className="card"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      transition: 'border-color var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            color: '#38bdf8',
                            background: 'rgba(56, 189, 248, 0.1)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                          }}
                        >
                          {t.ticketReference}
                        </span>

                        <span
                          style={{
                            background: cfg.bg,
                            color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {cfg.label}
                        </span>

                        <span
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          {t.categoryDisplayName || t.category}
                        </span>

                        {t.bookingReference && (
                          <span
                            style={{
                              background: 'rgba(245, 158, 11, 0.1)',
                              color: 'var(--accent-gold)',
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid rgba(245, 158, 11, 0.25)',
                            }}
                          >
                            Ref: {t.bookingReference}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Updated: {formatDate(t.updatedAt || t.createdAt)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          {t.subject}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Created on {formatDate(t.createdAt)} • {t.messageCount || 1} {t.messageCount === 1 ? 'message' : 'messages'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenConversation(t)}
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                        >
                          <MessageSquare size={16} />
                          <span>View Conversation</span>
                        </button>

                        {t.status !== 'CLOSED' && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setTicketToClose(t)}
                            style={{
                              padding: '0.45rem 0.75rem',
                              fontSize: '0.85rem',
                              borderColor: 'rgba(239, 68, 68, 0.4)',
                              color: '#f87171',
                            }}
                          >
                            <XCircle size={16} />
                            <span>Close</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUBMIT NEW TICKET */}
      {activeTab === 'new' && (
        <div
          className="card"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(1.25rem, 4vw, 2.5rem)',
            maxWidth: '800px',
            margin: '0 auto',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Create a Support Request
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Submit your inquiry and our support representatives will respond as soon as possible.
            </p>
          </div>

          <form onSubmit={handleCreateTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Category selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="ticket-category">
                Support Category <span style={{ color: 'var(--accent-red)' }}>*</span>
              </label>
              <select
                id="ticket-category"
                className="form-input form-select"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} — {cat.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="ticket-subject">
                  Subject <span style={{ color: 'var(--accent-red)' }}>*</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: formSubject.length > 200 ? '#ef4444' : 'var(--text-dim)' }}>
                  {formSubject.length}/200
                </span>
              </div>
              <input
                id="ticket-subject"
                type="text"
                className={`form-input ${formErrors.subject ? 'error' : ''}`}
                placeholder="Brief summary of the issue (e.g. Booking confirmation email not received)"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                maxLength={200}
                required
              />
              {formErrors.subject && (
                <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                  {formErrors.subject}
                </div>
              )}
            </div>

            {/* Optional Booking Reference */}
            <div className="form-group">
              <label className="form-label" htmlFor="ticket-booking-ref">
                Booking Reference (Optional)
              </label>
              <input
                id="ticket-booking-ref"
                type="text"
                className={`form-input ${formErrors.bookingRef ? 'error' : ''}`}
                placeholder="e.g. TKT-20261009-001 or Booking ID"
                value={formBookingRef}
                onChange={(e) => setFormBookingRef(e.target.value)}
                maxLength={50}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                If this request is related to an existing booking, providing your reference helps us resolve it faster.
              </span>
              {formErrors.bookingRef && (
                <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                  {formErrors.bookingRef}
                </div>
              )}
            </div>

            {/* Detailed Message */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="ticket-message">
                  Detailed Message <span style={{ color: 'var(--accent-red)' }}>*</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: formMessage.length > 4000 ? '#ef4444' : 'var(--text-dim)' }}>
                  {formMessage.length}/4000
                </span>
              </div>
              <textarea
                id="ticket-message"
                className={`form-input ${formErrors.message ? 'error' : ''}`}
                placeholder="Please provide full details of what occurred, show details, cinema theatre, or symptoms..."
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                rows={6}
                maxLength={4000}
                required
                style={{ resize: 'vertical' }}
              />
              {formErrors.message && (
                <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                  {formErrors.message}
                </div>
              )}
            </div>

            {/* Submit Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={() => setActiveTab('tickets')}
                disabled={isSubmittingNew}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-md"
                disabled={isSubmittingNew}
                style={{ minWidth: '160px' }}
              >
                <Send size={16} />
                <span>{isSubmittingNew ? 'Submitting...' : 'Submit Ticket'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 1: TICKET CONVERSATION VIEW */}
      {selectedTicket && (
        <Modal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket.ticketReference}`}
          maxWidth="750px"
        >
          <div>
            {/* Ticket Header & Status */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: STATUS_CONFIG[selectedTicket.status]?.bg,
                      color: STATUS_CONFIG[selectedTicket.status]?.color,
                      border: `1px solid ${STATUS_CONFIG[selectedTicket.status]?.border}`,
                      padding: '0.2rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {STATUS_CONFIG[selectedTicket.status]?.label || selectedTicket.status}
                  </span>

                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {selectedTicket.categoryDisplayName || selectedTicket.category}
                  </span>

                  {selectedTicket.bookingReference && (
                    <span
                      style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        color: 'var(--accent-gold)',
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                      }}
                    >
                      Booking Ref: {selectedTicket.bookingReference}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Created: {formatDate(selectedTicket.createdAt)}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedTicket.subject}
                </h3>
              </div>
            </div>

            {/* Informative Status Alerts */}
            {selectedTicket.status === 'WAITING_FOR_CUSTOMER' && (
              <div
                style={{
                  background: 'rgba(168, 85, 247, 0.12)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  color: '#c084fc',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <AlertCircle size={18} />
                <span>Our support desk is waiting for your reply. Submitting a reply below will automatically move your ticket back to <strong>Open</strong> status.</span>
              </div>
            )}

            {selectedTicket.status === 'RESOLVED' && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  color: 'var(--accent-emerald)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <CheckCircle2 size={18} />
                <span>This issue was marked as Resolved. If you still have questions, replying below will automatically reopen your ticket to <strong>Open</strong>.</span>
              </div>
            )}

            {selectedTicket.status === 'CLOSED' && (
              <div
                style={{
                  background: 'rgba(148, 163, 184, 0.12)',
                  border: '1px solid rgba(148, 163, 184, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <XCircle size={18} />
                <span>This ticket is <strong>Closed</strong> and cannot accept further replies. If you require additional assistance, please submit a new support request.</span>
              </div>
            )}

            {/* Conversation Messages Timeline */}
            <div
              style={{
                maxHeight: '360px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                paddingRight: '0.5rem',
                marginBottom: '1.5rem',
              }}
            >
              {loadingDetail ? (
                <LoadingState message="Loading conversation history..." height="150px" />
              ) : selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                selectedTicket.messages.map((m) => {
                  const isAdminMsg = m.senderType === 'ADMIN';
                  return (
                    <div
                      key={m.messageId}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isAdminMsg ? 'flex-start' : 'flex-end',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '85%',
                          background: isAdminMsg ? 'var(--bg-card)' : 'rgba(229, 9, 20, 0.12)',
                          border: `1px solid ${isAdminMsg ? 'rgba(56, 189, 248, 0.35)' : 'rgba(229, 9, 20, 0.35)'}`,
                          borderRadius: 'var(--radius-md)',
                          padding: '0.9rem 1.15rem',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            marginBottom: '0.4rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {isAdminMsg ? (
                              <span
                                style={{
                                  background: 'rgba(56, 189, 248, 0.15)',
                                  color: '#38bdf8',
                                  fontSize: '0.7rem',
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontWeight: 700,
                                }}
                              >
                                CinePass Support
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                You ({m.senderName})
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {formatDate(m.createdAt)}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.925rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                          {m.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                  No messages recorded in this ticket.
                </div>
              )}
            </div>

            {/* Reply Input Form (Disabled when ticket is closed) */}
            {selectedTicket.status !== 'CLOSED' ? (
              <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea
                  className="form-input"
                  placeholder="Type your reply message to support..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  maxLength={4000}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setTicketToClose(selectedTicket);
                    }}
                    style={{
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                      color: '#f87171',
                    }}
                  >
                    <XCircle size={16} />
                    <span>Close This Ticket</span>
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isSubmittingReply || !replyText.trim()}
                    style={{ minWidth: '130px' }}
                  >
                    <Send size={15} />
                    <span>{isSubmittingReply ? 'Sending...' : 'Send Reply'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-md"
                  onClick={() => {
                    setSelectedTicket(null);
                    setActiveTab('new');
                  }}
                >
                  <PlusCircle size={18} />
                  <span>Submit a New Ticket</span>
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL 2: CONFIRM TICKET CLOSURE */}
      {ticketToClose && (
        <Modal
          isOpen={Boolean(ticketToClose)}
          onClose={() => setTicketToClose(null)}
          title="Confirm Ticket Closure"
          maxWidth="460px"
        >
          <div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: '#ef4444',
              }}
            >
              <AlertCircle size={26} />
            </div>

            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to close ticket <strong>{ticketToClose.ticketReference}</strong>?
              <br />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Closed tickets cannot receive additional replies. If you have another inquiry later, you will need to open a new ticket.
              </span>
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={() => setTicketToClose(null)}
                disabled={isClosingTicket}
              >
                Keep Open
              </button>
              <button
                type="button"
                className="btn btn-primary btn-md"
                onClick={handleConfirmCloseTicket}
                disabled={isClosingTicket}
                style={{ background: '#ef4444', borderColor: '#dc2626' }}
              >
                {isClosingTicket ? 'Closing...' : 'Yes, Close Ticket'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Support;
