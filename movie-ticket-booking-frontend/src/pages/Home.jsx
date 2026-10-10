import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, Ticket, Calendar, Building2, ChevronRight, Sparkles, TrendingUp, LifeBuoy, MessageSquare } from 'lucide-react';
import movieService from '../services/movieService';
import theatreService from '../services/theatreService';
import showService from '../services/showService';
import MovieCard from '../components/movies/MovieCard';
import ShowCard from '../components/shows/ShowCard';
import TheatreCard from '../components/theatres/TheatreCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { getMovieVisuals } from '../utils/movieAssets';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchHomeData = async () => {
      try {
        const [moviesRes, theatresRes, showsRes] = await Promise.all([
          movieService.getAllMovies(),
          theatreService.getAllTheatres(),
          showService.getAllShows(),
        ]);

        if (active) {
          setMovies(Array.isArray(moviesRes) ? moviesRes : []);
          setTheatres(Array.isArray(theatresRes) ? theatresRes : []);
          setShows(Array.isArray(showsRes) ? showsRes : []);
        }
      } catch (err) {
        if (active) {
          console.error('Failed to load home page data:', err);
          setError({
            message: err.message || 'Could not fetch movies, theatres, or shows from the backend.',
            endpoint: err.endpoint || 'GET /movies, /theatres, /shows',
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchHomeData();
    return () => {
      active = false;
    };
  }, []);

  // Featured Movie for Hero Backdrop
  const featuredMovie = movies[0] || {
    title: 'Interstellar',
    genre: 'Sci-Fi',
    durationMinutes: 169,
    language: 'English',
  };
  const featuredVisuals = getMovieVisuals(featuredMovie.title, featuredMovie.genre);

  // Grouped datasets for sections
  const nowShowingMovies = movies.slice(0, 4);
  const popularMovies = movies.slice(0, 4).reverse();
  const featuredTheatres = theatres.slice(0, 3);
  const upcomingShows = shows.slice(0, 3);

  return (
    <div>
      {/* 1. Cinematic Hero Section */}
      <section className="hero-section">
        <img
          src={featuredVisuals.backdrop}
          alt={featuredMovie.title}
          className="hero-backdrop"
        />
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-pill">
            <Sparkles size={14} />
            <span>Premier Cinema Experience</span>
          </div>

          <h1 className="hero-title">
            Book Your Movie <br />
            <span className="hero-highlight">Experience Today.</span>
          </h1>

          <p className="hero-description">
            Immerse yourself in cinematic brilliance. Browse trending blockbusters, locate luxury partner theatres, reserve prime seats, and get instant verified booking passes.
          </p>

          <div className="hero-ctas">
            <Link to="/movies" className="btn btn-primary btn-lg">
              <Film size={20} />
              <span>Browse Movies</span>
            </Link>
            <Link to="/booking" className="btn btn-secondary btn-lg">
              <Ticket size={20} />
              <span>Instant Seat Booking</span>
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">{movies.length}+</span>
              <span className="stat-label">Movies Showing</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{theatres.length}+</span>
              <span className="stat-label">Luxury Theatres</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{shows.length}+</span>
              <span className="stat-label">Scheduled Shows</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">Realtime Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="page-wrapper">
        {loading ? (
          <LoadingState message="Connecting to cinema databases..." height="360px" />
        ) : error ? (
          <ErrorState
            title="Connection Notice"
            message={error.message}
            endpoint={error.endpoint}
            onRetry={fetchHomeData}
          />
        ) : (
          <>
            {/* 2. Now Showing Section */}
            <section style={{ marginBottom: '4rem' }}>
              <div className="section-header">
                <div className="section-title-wrap">
                  <span className="section-subtitle">In Theatres Now</span>
                  <h2 className="section-title">
                    <Film size={26} color="var(--accent-red)" />
                    <span>Now Showing</span>
                  </h2>
                </div>
                <Link to="/movies" className="btn btn-outline btn-sm">
                  <span>View All Movies</span>
                  <ChevronRight size={16} />
                </Link>
              </div>

              {nowShowingMovies.length === 0 ? (
                <EmptyState
                  title="No Movies Currently Showing"
                  message="No active movie listings are configured in the system."
                />
              ) : (
                <div className="grid-responsive grid-movies">
                  {nowShowingMovies.map((movie) => (
                    <MovieCard key={movie.movieId} movie={movie} />
                  ))}
                </div>
              )}
            </section>

            {/* 3. Popular Movies Showcase */}
            {movies.length > 2 && (
              <section style={{ marginBottom: '4rem' }}>
                <div className="section-header">
                  <div className="section-title-wrap">
                    <span className="section-subtitle">Top Rated & Trending</span>
                    <h2 className="section-title">
                      <TrendingUp size={26} color="var(--accent-gold)" />
                      <span>Popular Blockbusters</span>
                    </h2>
                  </div>
                  <Link to="/movies" className="btn btn-outline btn-sm">
                    <span>Explore All</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>

                <div className="grid-responsive grid-movies">
                  {popularMovies.map((movie) => (
                    <MovieCard key={`pop-${movie.movieId}`} movie={movie} />
                  ))}
                </div>
              </section>
            )}

            {/* 4. Upcoming Shows Grid */}
            <section style={{ marginBottom: '4rem' }}>
              <div className="section-header">
                <div className="section-title-wrap">
                  <span className="section-subtitle">Book Today's Tickets</span>
                  <h2 className="section-title">
                    <Calendar size={26} color="var(--accent-cyan)" />
                    <span>Upcoming Shows</span>
                  </h2>
                </div>
                <Link to="/booking" className="btn btn-outline btn-sm">
                  <span>Book Any Show</span>
                  <ChevronRight size={16} />
                </Link>
              </div>

              {upcomingShows.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No Shows Scheduled"
                  message="Upcoming showtimes will appear here once listed."
                />
              ) : (
                <div className="grid-responsive">
                  {upcomingShows.map((show) => (
                    <ShowCard key={show.showId} show={show} />
                  ))}
                </div>
              )}
            </section>

            {/* 5. Available Theatres */}
            <section style={{ marginBottom: '2rem' }}>
              <div className="section-header">
                <div className="section-title-wrap">
                  <span className="section-subtitle">Premium Venues</span>
                  <h2 className="section-title">
                    <Building2 size={26} color="var(--accent-gold)" />
                    <span>Available Theatres</span>
                  </h2>
                </div>
                <Link to="/theatres" className="btn btn-outline btn-sm">
                  <span>View All Theatres</span>
                  <ChevronRight size={16} />
                </Link>
              </div>

              {featuredTheatres.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No Theatres Listed"
                  message="Theatres will appear here once registered."
                />
              ) : (
                <div className="grid-responsive">
                  {featuredTheatres.map((theatre) => (
                    <TheatreCard key={theatre.theatreId} theatre={theatre} />
                  ))}
                </div>
              )}
            </section>

            {/* 6. Customer Support Entry Point */}
            <section style={{ marginBottom: '3rem' }}>
              <div
                className="card"
                style={{
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, var(--bg-card) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2.5rem 2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '2rem',
                }}
              >
                <div style={{ maxWidth: '600px' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: 'var(--accent-cyan)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <LifeBuoy size={16} />
                    <span>24/7 Dedicated Assistance</span>
                  </div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    Need Help With Your Booking or Tickets?
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                    Our customer support desk is ready to resolve booking issues, payment queries, ticket verifications, and cancellations with instant status tracking.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link to="/support" className="btn btn-primary btn-md">
                    <MessageSquare size={18} />
                    <span>Contact Support</span>
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
