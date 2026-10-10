import React, { useState, useEffect, useCallback } from 'react';
import ticketService from '../services/ticketService';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import DigitalTicketModal from '../components/tickets/DigitalTicketModal';
import { Ticket, Calendar, Clock, MapPin, Armchair, ChevronRight } from 'lucide-react';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketService.getMyTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load my tickets:', err);
      setError({
        message: err.message || 'Unable to retrieve your tickets.',
        endpoint: 'GET /customer/tickets',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    ticketService.getMyTickets()
      .then((data) => {
        if (active) setTickets(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) {
          console.error('Failed to load my tickets:', err);
          setError({
            message: err.message || 'Unable to retrieve your tickets.',
            endpoint: 'GET /customer/tickets',
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

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
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
          <span className="section-subtitle">Digital Admission Passes</span>
          <h1 className="section-title">
            <Ticket size={32} color="var(--accent-red)" />
            <span>My Digital Tickets</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Click on any ticket to reveal the full digital ticket pass, barcode, and seat allocation.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading your digital tickets..." />
      ) : error ? (
        <ErrorState
          title="Failed to Load Tickets"
          message={error.message}
          endpoint={error.endpoint}
          onRetry={fetchTickets}
        />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No Digital Tickets Available"
          message="You do not have any digital tickets issued yet. Book tickets to generate digital cinema passes."
          actionLabel="Book Tickets"
          actionLink="/booking"
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: '1.5rem',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {tickets.map((t) => (
            <div
              key={t.ticketId || t.ticketNumber}
              onClick={() => handleOpenTicket(t)}
              className="ticket-preview-card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'var(--transition-normal)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {/* Glow Accent */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #e50914, #38bdf8)',
                }}
              />

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#38bdf8', fontWeight: 700 }}>
                  {t.ticketNumber}
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                  {t.status || 'CONFIRMED'}
                </span>
              </div>

              {/* Movie Title */}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {t.movie}
              </h3>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} color="var(--text-muted)" />
                  <span>{t.theatre}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} color="var(--accent-cyan)" />
                  <span>{formatDate(t.showDate)}</span>
                  <span style={{ margin: '0 0.2rem' }}>•</span>
                  <Clock size={14} color="var(--accent-gold)" />
                  <span>{formatTime(t.showTime)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Armchair size={14} color="var(--seat-selected)" />
                  <span>Seats: {Array.isArray(t.seats) ? t.seats.join(', ') : 'N/A'}</span>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px dashed var(--border-subtle)',
                  paddingTop: '0.85rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total Amount</span>
                  <div style={{ fontWeight: 800, color: 'var(--accent-gold)', fontSize: '1.1rem' }}>
                    ₹{Number(t.totalAmount || 0).toFixed(2)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>View Pass</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Digital Ticket Pass Modal */}
      <DigitalTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ticket={selectedTicket}
      />
    </div>
  );
};

export default MyTickets;
