import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Tv, Sparkles, Ticket } from 'lucide-react';

const TheatreCard = ({ theatre }) => {
  if (!theatre) return null;

  const { theatreId, name, location, totalScreens } = theatre;

  return (
    <div className="theatre-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div className="theatre-icon-box">
          <Building2 size={24} />
        </div>
        <span className="badge badge-gold">
          <Tv size={12} />
          <span>{totalScreens} Screens</span>
        </span>
      </div>

      <div className="theatre-details">
        <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700 }}>
          {name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          <MapPin size={15} color="var(--accent-red)" />
          <span>{location}</span>
        </div>
      </div>

      <div className="theatre-features">
        <span className="badge badge-subtle">Dolby Atmos</span>
        <span className="badge badge-subtle">4K Laser</span>
        <span className="badge badge-subtle">Luxury Recliners</span>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <Link
          to={`/booking?theatreId=${theatreId}`}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%' }}
        >
          <Ticket size={15} />
          <span>Book At This Theatre</span>
        </Link>
      </div>
    </div>
  );
};

export default TheatreCard;
