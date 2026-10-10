import React from 'react';

/**
 * Graphical Cinema Seat Layout component
 * - Strictly NO emojis
 * - Graphical HTML/CSS seats
 * - AVAILABLE = GREY (#64748b)
 * - SELECTED = GREEN (#10b981)
 * - BOOKED = RED (#dc2626)
 * - Consistent in both dark and light themes
 */
const SeatGrid = ({ seats, selectedSeats, onToggleSeat, ticketPrice = 0 }) => {
  // Group seats by row letter (e.g. 'A', 'B', 'C')
  const rows = React.useMemo(() => {
    const map = {};
    (seats || []).forEach((seat) => {
      const seatNum = seat.seatNumber || '';
      const rowLetter = seatNum.replace(/[0-9]/g, '') || 'A';
      if (!map[rowLetter]) {
        map[rowLetter] = [];
      }
      map[rowLetter].push(seat);
    });

    // Sort each row's seats by column number
    Object.keys(map).forEach((r) => {
      map[r].sort((a, b) => {
        const colA = parseInt(a.seatNumber.replace(/\D/g, '') || '0', 10);
        const colB = parseInt(b.seatNumber.replace(/\D/g, '') || '0', 10);
        return colA - colB;
      });
    });

    // Sort row keys alphabetically
    return Object.keys(map)
      .sort()
      .map((rowKey) => ({
        rowKey,
        seats: map[rowKey],
      }));
  }, [seats]);

  return (
    <div className="cinema-seat-selection-container" style={{ width: '100%' }}>
      {/* Cinema Screen Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            height: '10px',
            maxWidth: '580px',
            margin: '0 auto 0.75rem',
            background: 'linear-gradient(90deg, rgba(6, 182, 212, 0) 0%, #06b6d4 50%, rgba(6, 182, 212, 0) 100%)',
            borderRadius: '999px',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.75)',
            transform: 'perspective(300px) rotateX(-20deg)',
          }}
        />
        <span
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--accent-cyan)',
            fontWeight: 700,
          }}
        >
          CINEMA SCREEN THIS WAY
        </span>
      </div>

      {/* Seat Legend - Consistent Status Colours in Both Themes */}
      <div className="seat-legend">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '5px 5px 3px 3px',
              background: '#64748b',
              border: '1px solid #475569',
              boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
            }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Available (Grey)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '5px 5px 3px 3px',
              background: '#10b981',
              border: '1px solid #059669',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
            }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Selected (Green)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '5px 5px 3px 3px',
              background: '#dc2626',
              border: '1px solid #ef4444',
              opacity: 0.85,
            }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Booked (Red)</span>
        </div>
      </div>

      {/* Horizontal Scroll Hint for Mobile/Tablet */}
      <div className="seat-scroll-hint">
        <span>↔</span> Swipe horizontally to view full cinema layout
      </div>

      {/* Graphical Cinema Seats Grid */}
      <div className="cinema-seat-map-scroll">
        <div className="cinema-seat-map-inner">
          {rows.map(({ rowKey, seats: rowSeats }) => (
            <div
              key={rowKey}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {/* Left Row Identifier */}
              <span
                style={{
                  width: '24px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                }}
              >
                {rowKey}
              </span>

              {/* Row Seats */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.45rem',
                }}
              >
                {rowSeats.map((seat) => {
                  const isBooked = seat.status === 'BOOKED';
                  const isSelected = selectedSeats.includes(seat.seatNumber);

                  // Consistent status colours: Available=Grey, Selected=Green, Booked=Red
                  let bgColor = '#64748b';
                  let textColor = '#ffffff';
                  let borderColor = '#475569';
                  let glowShadow = '0 2px 4px rgba(0,0,0,0.2)';
                  let headrestColor = '#94a3b8';

                  if (isBooked) {
                    bgColor = '#dc2626';
                    textColor = '#ffffff';
                    borderColor = '#ef4444';
                    glowShadow = 'none';
                    headrestColor = '#fca5a5';
                  } else if (isSelected) {
                    bgColor = '#10b981';
                    textColor = '#ffffff';
                    borderColor = '#059669';
                    glowShadow = '0 0 10px rgba(16, 185, 129, 0.8), 0 2px 6px rgba(0,0,0,0.4)';
                    headrestColor = '#a7f3d0';
                  }

                  return (
                    <button
                      key={seat.seatId}
                      type="button"
                      disabled={isBooked}
                      onClick={() => onToggleSeat(seat.seatNumber)}
                      title={`Seat ${seat.seatNumber} (${seat.status})`}
                      aria-label={`Seat ${seat.seatNumber} - ${seat.status}`}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px 8px 4px 4px',
                        background: bgColor,
                        color: textColor,
                        border: `1.5px solid ${borderColor}`,
                        boxShadow: glowShadow,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: isBooked ? 'not-allowed' : 'pointer',
                        opacity: isBooked ? 0.85 : 1,
                        transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        outline: 'none',
                      }}
                    >
                      {/* Headrest aesthetic indicator */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '2px',
                          width: '18px',
                          height: '2px',
                          borderRadius: '2px',
                          background: headrestColor,
                        }}
                      />
                      <span style={{ marginTop: '2px' }}>{seat.seatNumber}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Row Identifier */}
              <span
                style={{
                  width: '24px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                }}
              >
                {rowKey}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Seats Real-time Billing Panel */}
      <div className="seat-billing-panel">
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
            Selected Seats
          </span>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            {selectedSeats.length > 0 ? (
              selectedSeats.map((sn) => (
                <span
                  key={sn}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  {sn}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No seats selected yet. Click any grey seat above.
              </span>
            )}
          </div>
        </div>

        <div className="seat-billing-summary">
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ticket Price:</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{Number(ticketPrice).toFixed(2)}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Seats:</span>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{selectedSeats.length}</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 600 }}>TOTAL AMOUNT</span>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              ₹{(selectedSeats.length * Number(ticketPrice)).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
