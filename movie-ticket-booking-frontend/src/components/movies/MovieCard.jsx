import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Globe, Film, Star, Ticket } from 'lucide-react';
import { getMovieVisuals } from '../../utils/movieAssets';

const MovieCard = ({ movie }) => {
  if (!movie) return null;

  const { movieId, title, genre, durationMinutes, language } = movie;
  const visuals = getMovieVisuals(title, genre);

  // Genre badge color selector
  const getGenreBadgeClass = (g = '') => {
    const low = g.toLowerCase();
    if (low.includes('action')) return 'badge-red';
    if (low.includes('sci-fi')) return 'badge-cyan';
    if (low.includes('drama')) return 'badge-purple';
    if (low.includes('comedy')) return 'badge-gold';
    return 'badge-subtle';
  };

  return (
    <div className="movie-card">
      {/* Poster area */}
      <div className="movie-poster-wrap">
        <img
          src={visuals.poster}
          alt={`${title} poster`}
          className="movie-poster"
          loading="lazy"
        />
        <div className="movie-poster-gradient" />

        {/* Top Badges */}
        <div className="movie-badge-left">
          <span className={`badge ${getGenreBadgeClass(genre)}`}>
            {genre}
          </span>
        </div>

        <div className="movie-badge-top">
          <div className="movie-rating-badge">
            <Star size={13} fill="#fbbf24" stroke="#fbbf24" />
            <span>{visuals.rating}</span>
          </div>
        </div>
      </div>

      {/* Info Details */}
      <div className="movie-info">
        <h3 className="movie-title" title={title}>
          {title}
        </h3>

        <div className="movie-meta-chips">
          <span className="meta-chip">
            <Globe size={13} />
            <span>{language}</span>
          </span>
          <span className="chip-divider" />
          <span className="meta-chip">
            <Clock size={13} />
            <span>{durationMinutes} min</span>
          </span>
        </div>

        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            lineHeight: '1.45',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {visuals.tagline || visuals.description}
        </p>

        {/* Card Footer Actions */}
        <div className="movie-card-footer">
          <Link
            to={`/movies/${movieId}`}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
          >
            <Film size={15} />
            <span>View Shows</span>
          </Link>
          <Link
            to={`/booking?movieId=${movieId}`}
            className="btn btn-primary btn-sm"
            title="Directly select shows and book seats"
          >
            <Ticket size={15} />
            <span>Book</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
