import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import supportService from '../services/supportService';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import {
  LifeBuoy,
  Search,
  Filter,
  Eye,
  Send,
  RefreshCw,
  Shield,
  MessageSquare,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

const CATEGORY_MAP = {
  BOOKING_ISSUE: 'Booking Issue',
  PAYMENT_ISSUE: 'Payment Issue',
  TICKET_ISSUE: 'Ticket Issue',
  SEAT_SELECTION: 'Seat Selection',
  CANCELLATION_REFUND: 'Cancellation / Refund',
  ACCOUNT_ISSUE: 'Account Issue',
  OTHER: 'Other Support',
};

const getCategoryLabel = (category) => CATEGORY_MAP[category] || category || 'General';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'OPEN':
      return 'badge-primary';
    case 'IN_PROGRESS':
      return 'badge-warning';
    case 'WAITING_FOR_CUSTOMER':
      return 'badge-info';
    case 'RESOLVED':
      return 'badge-success';
    case 'CLOSED':
      return 'badge-secondary';
    default:
      return 'badge-primary';
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
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

const AdminSupportDesk = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters and search
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected ticket for modal detail & reply
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { addToast } = useToast();

  const loadTickets = useCallback(
    async (isSilent = false) => {
      if (isSilent) {
        setRefreshing(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const data = await supportService.getAdminTickets();
        setTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load support tickets:', err);
        if (!isSilent) {
          setError({
            message: err.message || 'Unable to load administrator support tickets.',
            endpoint: 'GET /admin/support/tickets',
          });
        } else {
          addToast(err.message || 'Failed to refresh support tickets.', 'error');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    let active = true;
    supportService
      .getAdminTickets()
      .then((data) => {
        if (active) {
          setTickets(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (active) {
          console.error('Failed to load support tickets:', err);
          setError({
            message: err.message || 'Unable to load administrator support tickets.',
            endpoint: 'GET /admin/support/tickets',
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

  const handleOpenDetail = async (ticketId) => {
    setLoadingDetail(true);
    try {
      const detail = await supportService.getAdminTicketDetail(ticketId);
      setSelectedTicket(detail);
      setTargetStatus(detail.status);
      setAdminReplyText('');
    } catch (err) {
      console.error('Failed to load support ticket detail:', err);
      addToast(err.message || 'Failed to load ticket details.', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAdminSendReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || isSendingReply) return;

    const trimmed = adminReplyText.trim();
    if (!trimmed) {
      addToast('Please enter a reply message before submitting.', 'error');
      return;
    }

    if (trimmed.length < 2) {
      addToast('Reply message must be at least 2 characters.', 'error');
      return;
    }

    if (selectedTicket.status === 'CLOSED') {
      addToast('Cannot reply to a closed ticket.', 'error');
      return;
    }

    setIsSendingReply(true);
    try {
      // Use existing supportService.adminReply method
      const updatedTicket = await supportService.adminReply(selectedTicket.ticketId, trimmed);
      setSelectedTicket(updatedTicket);
      setTargetStatus(updatedTicket.status);
      setAdminReplyText('');
      addToast('Reply sent successfully to customer!', 'success');

      // Update ticket in local list immediately and refresh in background
      setTickets((prev) =>
        prev.map((t) => (t.ticketId === updatedTicket.ticketId ? { ...t, ...updatedTicket } : t))
      );
      loadTickets(true);
    } catch (err) {
      console.error('Failed to send admin reply:', err);
      addToast(err.message || 'Failed to send reply to customer.', 'error');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleAdminUpdateStatus = async (newStatus) => {
    if (!selectedTicket || !newStatus || isUpdatingStatus) return;
    if (newStatus === selectedTicket.status) return;

    // Validate business rule: CLOSED is a terminal state
    if (selectedTicket.status === 'CLOSED' && newStatus !== 'CLOSED') {
      addToast('CLOSED is a terminal ticket state. Closed tickets cannot be reopened.', 'error');
      setTargetStatus('CLOSED');
      return;
    }

    setIsUpdatingStatus(true);
    try {
      // Use existing supportService.adminUpdateStatus method
      const updatedTicket = await supportService.adminUpdateStatus(selectedTicket.ticketId, newStatus);
      setSelectedTicket(updatedTicket);
      setTargetStatus(updatedTicket.status);
      addToast(`Ticket status updated to ${newStatus}`, 'success');

      // Update ticket in local list immediately and refresh in background
      setTickets((prev) =>
        prev.map((t) => (t.ticketId === updatedTicket.ticketId ? { ...t, ...updatedTicket } : t))
      );
      loadTickets(true);
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      addToast(err.message || 'Failed to update ticket status.', 'error');
      // Revert select dropdown to previous status
      setTargetStatus(selectedTicket.status);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const refMatch = t.ticketReference?.toLowerCase().includes(q);
      const subMatch = t.subject?.toLowerCase().includes(q);
      const custMatch =
        t.customerName?.toLowerCase().includes(q) || t.customerEmail?.toLowerCase().includes(q);
      const bookMatch = t.bookingReference?.toLowerCase().includes(q);
      if (!refMatch && !subMatch && !custMatch && !bookMatch) return false;
    }
    return true;
  });

  // Calculate ticket counts for quick KPI cards
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const waitingCount = tickets.filter((t) => t.status === 'WAITING_FOR_CUSTOMER').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;
  const closedCount = tickets.filter((t) => t.status === 'CLOSED').length;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="section-header">
        <div className="section-title-wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
              <Shield size={14} style={{ marginRight: '4px' }} />
              Administrator Control Center
            </span>
          </div>
          <h1 className="section-title" style={{ marginTop: '0.5rem' }}>
            <span>Support Desk</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Review incoming customer support requests, reply to active tickets, and manage lifecycle status.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/admin" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={16} />
            <span>Operations Dashboard</span>
          </Link>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => loadTickets(true)}
            disabled={refreshing || loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Tickets'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading administrator support tickets and conversation queues..." />
      ) : error ? (
        <ErrorState
          title="Support Desk Unavailable"
          message={error.message}
          endpoint={error.endpoint}
          onRetry={() => loadTickets(false)}
        />
      ) : (
        <div>
          {/* Quick Stats Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            {/* Total Tickets */}
            <div
              className="card"
              onClick={() => setStatusFilter('ALL')}
              style={{
                background: statusFilter === 'ALL' ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-card)',
                border: statusFilter === 'ALL' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Tickets
                </span>
                <LifeBuoy size={16} color="var(--accent-cyan)" />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {totalCount}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>All categories</span>
            </div>

            {/* Open */}
            <div
              className="card"
              onClick={() => setStatusFilter('OPEN')}
              style={{
                background: statusFilter === 'OPEN' ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card)',
                border: statusFilter === 'OPEN' ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
                  Open
                </span>
                <AlertTriangle size={16} color="#38bdf8" />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>
                {openCount}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Needs initial review</span>
            </div>

            {/* In Progress */}
            <div
              className="card"
              onClick={() => setStatusFilter('IN_PROGRESS')}
              style={{
                background: statusFilter === 'IN_PROGRESS' ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-card)',
                border: statusFilter === 'IN_PROGRESS' ? '1px solid #fbbf24' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600, textTransform: 'uppercase' }}>
                  In Progress
                </span>
                <Clock size={16} color="#fbbf24" />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24' }}>
                {inProgressCount}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Being investigated</span>
            </div>

            {/* Waiting for Customer */}
            <div
              className="card"
              onClick={() => setStatusFilter('WAITING_FOR_CUSTOMER')}
              style={{
                background: statusFilter === 'WAITING_FOR_CUSTOMER' ? 'rgba(168, 85, 247, 0.12)' : 'var(--bg-card)',
                border: statusFilter === 'WAITING_FOR_CUSTOMER' ? '1px solid #c084fc' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 600, textTransform: 'uppercase' }}>
                  Waiting
                </span>
                <MessageSquare size={16} color="#c084fc" />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: '#c084fc' }}>
                {waitingCount}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Awaiting customer reply</span>
            </div>

            {/* Resolved / Closed */}
            <div
              className="card"
              onClick={() => setStatusFilter('RESOLVED')}
              style={{
                background: statusFilter === 'RESOLVED' || statusFilter === 'CLOSED' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                border: statusFilter === 'RESOLVED' || statusFilter === 'CLOSED' ? '1px solid #34d399' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, textTransform: 'uppercase' }}>
                  Resolved / Closed
                </span>
                <CheckCircle2 size={16} color="#34d399" />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>
                {resolvedCount + closedCount}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                {resolvedCount} resolved • {closedCount} closed
              </span>
            </div>
          </div>

          {/* Main Card with Toolbar & Table */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            {/* Filters & Search Toolbar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Search size={14} /> Search
                </label>
                <input
                  type="text"
                  className="form-input form-input-sm"
                  placeholder="Search by ref, subject, customer, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Filter size={14} /> Status Filter
                </label>
                <select
                  className="form-input form-input-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses ({totalCount})</option>
                  <option value="OPEN">OPEN ({openCount})</option>
                  <option value="IN_PROGRESS">IN_PROGRESS ({inProgressCount})</option>
                  <option value="WAITING_FOR_CUSTOMER">WAITING_FOR_CUSTOMER ({waitingCount})</option>
                  <option value="RESOLVED">RESOLVED ({resolvedCount})</option>
                  <option value="CLOSED">CLOSED ({closedCount})</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>
                  Category Filter
                </label>
                <select
                  className="form-input form-input-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="BOOKING_ISSUE">Booking Issue</option>
                  <option value="PAYMENT_ISSUE">Payment Issue</option>
                  <option value="TICKET_ISSUE">Ticket Issue</option>
                  <option value="SEAT_SELECTION">Seat Selection</option>
                  <option value="CANCELLATION_REFUND">Cancellation / Refund</option>
                  <option value="ACCOUNT_ISSUE">Account Issue</option>
                  <option value="OTHER">Other Support</option>
                </select>
              </div>

              {(statusFilter !== 'ALL' || categoryFilter !== 'ALL' || searchQuery.trim()) && (
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setStatusFilter('ALL');
                      setCategoryFilter('ALL');
                      setSearchQuery('');
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <RotateCcw size={14} />
                    <span>Reset Filters</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tickets Table */}
            {filteredTickets.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3.5rem 1.5rem',
                  color: 'var(--text-muted)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <LifeBuoy size={44} style={{ opacity: 0.35, marginBottom: '0.75rem' }} />
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.4rem' }}>No Support Tickets Found</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                    ? 'No support tickets match the current filter criteria. Try clearing filters.'
                    : 'There are currently no customer support tickets logged in the database.'}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Customer</th>
                      <th>Category</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((t) => (
                      <tr key={t.ticketId}>
                        <td style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                          {t.ticketReference}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {t.customerEmail}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {getCategoryLabel(t.category)}
                          </span>
                        </td>
                        <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.subject}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {formatDate(t.updatedAt || t.createdAt)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenDetail(t.ticketId)}
                            disabled={loadingDetail}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Eye size={14} />
                            <span>Inspect & Respond</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Support Ticket Inspection & Reply Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket ? `Support Ticket: ${selectedTicket.ticketReference}` : 'Ticket Details'}
        maxWidth="750px"
      >
        {selectedTicket && (
          <div>
            {/* Header / Info bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${getStatusBadgeClass(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                  <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                    {getCategoryLabel(selectedTicket.category)}
                  </span>
                  {selectedTicket.bookingReference && (
                    <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                      Booking: {selectedTicket.bookingReference}
                    </span>
                  )}
                </div>
                <h4 style={{ color: 'var(--text-primary)', margin: '0.5rem 0 0.25rem', fontSize: '1.15rem' }}>
                  {selectedTicket.subject}
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Customer: <strong style={{ color: 'var(--text-primary)' }}>{selectedTicket.customerName}</strong> ({selectedTicket.customerEmail})
                </div>
              </div>

              {/* Status Update Control */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  MANAGE STATUS
                </label>
                {selectedTicket.status === 'CLOSED' ? (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    CLOSED (Terminal)
                  </span>
                ) : (
                  <select
                    className="form-input form-input-sm"
                    value={targetStatus}
                    onChange={(e) => {
                      const nextVal = e.target.value;
                      setTargetStatus(nextVal);
                      handleAdminUpdateStatus(nextVal);
                    }}
                    disabled={isUpdatingStatus}
                    style={{ minWidth: '160px' }}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="WAITING_FOR_CUSTOMER">WAITING_FOR_CUSTOMER</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED (Close Ticket)</option>
                  </select>
                )}
              </div>
            </div>

            {/* Conversation Messages Thread */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Conversation History ({selectedTicket.messages?.length || 0})
              </h5>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  paddingRight: '0.5rem',
                }}
              >
                {selectedTicket.messages?.length > 0 ? (
                  selectedTicket.messages.map((msg) => {
                    const isAdmin = msg.senderType === 'ADMIN';
                    return (
                      <div
                        key={msg.messageId}
                        style={{
                          padding: '1rem',
                          borderRadius: 'var(--radius-md)',
                          background: isAdmin ? 'rgba(245, 158, 11, 0.08)' : 'rgba(56, 189, 248, 0.06)',
                          border: isAdmin
                            ? '1px solid rgba(245, 158, 11, 0.25)'
                            : '1px solid rgba(56, 189, 248, 0.2)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem',
                            fontSize: '0.8rem',
                          }}
                        >
                          <span style={{ fontWeight: 600, color: isAdmin ? 'var(--accent-gold)' : 'var(--accent-cyan)' }}>
                            {isAdmin ? '🛡️ Administrator Support' : `👤 ${msg.senderName || 'Customer'}`}
                          </span>
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                    No messages recorded in this ticket.
                  </div>
                )}
              </div>
            </div>

            {/* Admin Reply Form */}
            {selectedTicket.status === 'CLOSED' ? (
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                This ticket is <strong>CLOSED</strong>. No further responses can be submitted.
              </div>
            ) : (
              <form onSubmit={handleAdminSendReply}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>
                    Reply to Customer
                  </label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Enter support response to the customer..."
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    required
                    maxLength={4000}
                    disabled={isSendingReply}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {adminReplyText.length} / 4000
                    </span>
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '0.5rem 0 0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedTicket(null)}
                    disabled={isSendingReply}
                  >
                    Close Window
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isSendingReply || !adminReplyText.trim()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Send size={14} />
                    <span>{isSendingReply ? 'Sending Reply...' : 'Send Customer Reply'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminSupportDesk;
