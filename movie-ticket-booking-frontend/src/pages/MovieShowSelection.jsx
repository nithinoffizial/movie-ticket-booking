import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Globe, ArrowLeft, Star, Ticket, Filter } from 'lucide-react';
import movieService from '../services/movieService';
import showService from '../services/showService';
import ShowCard from '../components/shows/ShowCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { getMovieVisuals } from '../utils/movieAssets';

const MovieShowSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter shows by selected date or theatre
  const [selectedDate, setSelectedDate] = useState('ALL');
  const [selectedTheatre, setSelectedTheatre] = useState('ALL');

  const fetchMovieAndShows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [movieData, allShows] = await Promise.all([
        movieService.getMovieById(id),
        showService.getAllShows(),
      ]);

      setMovie(movieData);

      // Filter shows belonging to this movie
      const movieShows = (Array.isArray(allShows) ? allShows : []).filter(
        (s) => s.movie && Number(s.movie.movieId) === Number(id)
      );
      setShows(movieShows);
    } catch (err) {
      console.error('Error fetching movie or shows:', err);
      setError({
        message: err.message || `Unable to load movie details for ID #${id}`,
        endpoint: `GET /movies/${id} and /shows`,
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    Promise.all([
      movieService.getMovieById(id),
      showService.getAllShows(),
    ]).then(([movieData, allShows]) => {
      if (active) {
        setMovie(movieData);
        const movieShows = (Array.isArray(allShows) ? allShows : []).filter(
          (s) => s.movie && Number(s.movie.movieId) === Number(id)
        );
        setShows(movieShows);
      }
    }).catch((err) => {
      if (active) {
        console.error('Error fetching movie or shows:', err);
        setError({
          message: err.message || `Unable to load movie details for ID #${id}`,
          endpoint: `GET /movies/${id} and /shows`,
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
  }, [id]);

  // Unique dates and theatres for filter pills
  const availableDates = useMemo(() => {
    const set = new Set();
    shows.forEach((s) => {
      if (s.showDate) set.add(s.showDate);
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [shows]);

  const availableTheatres = useMemo(() => {
    const set = new Set();
    shows.forEach((s) => {
      if (s.theatre?.name) set.add(s.theatre.name);
    });
    return ['ALL', ...Array.from(set)];
  }, [shows]);

  // Filtered shows
  const filteredShows = useMemo(() => {
    return shows.filter((s) => {
      const matchesDate = selectedDate === 'ALL' || s.showDate === selectedDate;
      const matchesTheatre = selectedTheatre === 'ALL' || s.theatre?.name === selectedTheatre;
      return matchesDate && matchesTheatre;
    });
  }, [shows, selectedDate, selectedTheatre]);

  const visuals = movie ? getMovieVisuals(movie.title, movie.genre) : null;

  const formatDateDisplay = (dateStr) => {
    if (dateStr === 'ALL') return 'All Dates';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingState message="Loading movie profile and scheduled showtimes..." height="400px" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="page-wrapper">
        <Link to="/movies" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Movies</span>
        </Link>
        <ErrorState
          title="Movie Unavailable"
          message={error?.message || 'The requested movie could not be found.'}
          endpoint={error?.endpoint || `GET /movies/${id}`}
          onRetry={fetchMovieAndShows}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Movie Details Banner */}
      <section
        style={{
          position: 'relative',
          padding: '3rem 1.5rem',
          backgroundColor: '#0c101b',
          borderBottom: '1px solid var(--border-subtle)',
          overflow: 'hidden',
        }}
      >
        <img
          src={visuals.backdrop}
          alt={movie.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.18,
            filter: 'blur(8px)',
            transform: 'scale(1.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, var(--bg-glass) 0%, var(--bg-primary) 100%)',
          }}
        />

        <div className="page-wrapper" style={{ position: 'relative', zIndex: 5, padding: 'clamp(1.25rem, 3.5vw, 2.5rem) clamp(0.85rem, 3vw, 1.75rem)' }}>
          <Link
            to="/movies"
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '2rem', display: 'inline-flex' }}
          >
            <ArrowLeft size={16} />
            <span>Back to All Movies</span>
          </Link>

          <div className="movie-detail-hero">
            {/* Poster Card */}
            <div
              className="movie-detail-poster-wrap"
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-subtle)',
                aspectRatio: '2/3',
                width: '100%',
              }}
            >
              <img
                src={visuals.poster}
                alt={movie.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Movie Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className="badge badge-red">{movie.genre}</span>
                <span className="badge badge-gold">
                  <Star size={13} fill="#fbbf24" stroke="#fbbf24" />
                  <span>{visuals.rating} / 10 ({visuals.votes})</span>
                </span>
                <span className="badge badge-subtle">{movie.language}</span>
              </div>

              <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', color: 'var(--text-primary)', lineHeight: 1.15, overflowWrap: 'break-word' }}>
                {movie.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} color="var(--accent-red)" />
                  <span>{movie.durationMinutes} Minutes</span>
                </div>
                <div className="chip-divider" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Globe size={16} color="var(--accent-cyan)" />
                  <span>{movie.language}</span>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.65', maxWidth: '720px' }}>
                {visuals.description}
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  maxWidth: '720px',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                    Director
                  </span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                    {visuals.director}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                    Starring Cast
                  </span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                    {visuals.stars}
                  </div>
                </div>
              </div>

              <div>
                <Link
                  to={`/booking?movieId=${movie.movieId}`}
                  className="btn btn-primary btn-md"
                  style={{ display: 'inline-flex', maxWidth: '100%', whiteSpace: 'normal', lineHeight: 1.35 }}
                >
                  <Ticket size={18} style={{ flexShrink: 0 }} />
                  <span>Book Tickets for {movie.title}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Shows Selection Section */}
      <div className="page-wrapper">
        <div className="section-header">
          <div className="section-title-wrap">
            <span className="section-subtitle">Showtimes & Theatres</span>
            <h2 className="section-title">
              <Calendar size={26} color="var(--accent-red)" />
              <span>Available Shows for {movie.title}</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Select a theatre, date, and preferred showtime to proceed with your seat booking.
            </p>
          </div>

          <span className="badge badge-emerald" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
            {filteredShows.length} Shows Found
          </span>
        </div>

        {/* Filter Controls for Dates & Theatres */}
        {shows.length > 0 && (
          <div className="filter-bar" style={{ marginBottom: '2rem' }}>
            {/* Date Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginRight: '0.25rem' }}>
                Date:
              </span>
              {availableDates.map((dateStr) => (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`btn btn-sm ${selectedDate === dateStr ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {formatDateDisplay(dateStr)}
                </button>
              ))}
            </div>

            {/* Theatre Filter */}
            {availableTheatres.length > 2 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Theatre:</span>
                <select
                  className="form-select"
                  value={selectedTheatre}
                  onChange={(e) => setSelectedTheatre(e.target.value)}
                  style={{ width: 'auto', minWidth: '180px' }}
                >
                  <option value="ALL">All Theatres</option>
                  {availableTheatres.filter((t) => t !== 'ALL').map((theatreName) => (
                    <option key={theatreName} value={theatreName}>
                      {theatreName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Shows Listing */}
        {shows.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Shows Scheduled Yet"
            message={`There are currently no active shows scheduled for "${movie.title}". Please check back soon or browse other movies.`}
            actionText="Browse Other Movies"
            actionLink="/movies"
          />
        ) : filteredShows.length === 0 ? (
          <EmptyState
            icon={Filter}
            title="No Shows on Selected Date"
            message="No shows match your selected date or theatre filter. Try selecting 'All Dates'."
            actionText="Reset Show Filters"
            onAction={() => {
              setSelectedDate('ALL');
              setSelectedTheatre('ALL');
            }}
          />
        ) : (
          <div className="grid-responsive">
            {filteredShows.map((show) => (
              <ShowCard
                key={show.showId}
                show={show}
                onSelect={(selectedShow) => {
                  navigate(`/shows/${selectedShow.showId}/seats`);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieShowSelection;
