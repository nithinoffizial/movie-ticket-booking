import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Film, Search, Plus } from 'lucide-react';
import movieService from '../services/movieService';
import MovieCard from '../components/movies/MovieCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Movies = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [sortBy, setSortBy] = useState('default');

  // Add Movie Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMovieData, setNewMovieData] = useState({
    title: '',
    genre: '',
    durationMinutes: '',
    language: '',
  });

  const { addToast } = useToast();

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await movieService.getAllMovies();
      setMovies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError({
        message: err.message || 'Unable to retrieve movie listings from backend.',
        endpoint: 'GET /movies',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    movieService.getAllMovies()
      .then((data) => {
        if (active) setMovies(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) {
          console.error('Error fetching movies:', err);
          setError({
            message: err.message || 'Unable to retrieve movie listings from backend.',
            endpoint: 'GET /movies',
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

  // Compute unique genres and languages dynamically from real data
  const genres = useMemo(() => {
    const set = new Set();
    movies.forEach((m) => {
      if (m.genre) set.add(m.genre);
    });
    return ['ALL', ...Array.from(set)];
  }, [movies]);

  const languages = useMemo(() => {
    const set = new Set();
    movies.forEach((m) => {
      if (m.language) set.add(m.language);
    });
    return ['ALL', ...Array.from(set)];
  }, [movies]);

  // Filter & Sort Logic
  const filteredMovies = useMemo(() => {
    return movies
      .filter((movie) => {
        const matchesSearch =
          movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movie.genre?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenre === 'ALL' || movie.genre === selectedGenre;
        const matchesLang = selectedLanguage === 'ALL' || movie.language === selectedLanguage;
        return matchesSearch && matchesGenre && matchesLang;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'duration-asc') return a.durationMinutes - b.durationMinutes;
        if (sortBy === 'duration-desc') return b.durationMinutes - a.durationMinutes;
        return 0;
      });
  }, [movies, searchTerm, selectedGenre, selectedLanguage, sortBy]);

  // Handle Add Movie
  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !isAdmin) {
      addToast('Administrator privileges required to add movies.', 'error');
      return;
    }
    if (!newMovieData.title.trim()) {
      addToast('Please enter a movie title', 'error');
      return;
    }
    if (!newMovieData.genre.trim()) {
      addToast('Please enter a genre', 'error');
      return;
    }
    const duration = parseInt(newMovieData.durationMinutes, 10);
    if (isNaN(duration) || duration <= 0) {
      addToast('Please enter a valid duration in minutes', 'error');
      return;
    }
    if (!newMovieData.language.trim()) {
      addToast('Please enter a language', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await movieService.createMovie({
        title: newMovieData.title.trim(),
        genre: newMovieData.genre.trim(),
        durationMinutes: duration,
        language: newMovieData.language.trim(),
      });
      addToast(`Movie "${newMovieData.title}" added successfully!`, 'success');
      setIsAddModalOpen(false);
      setNewMovieData({ title: '', genre: '', durationMinutes: '', language: '' });
      fetchMovies();
    } catch (err) {
      console.error('Failed to create movie:', err);
      addToast(err.message || 'Failed to add movie to catalog', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header Banner */}
      <div className="section-header">
        <div className="section-title-wrap">
          <span className="section-subtitle">Cinema Catalog</span>
          <h1 className="section-title">
            <Film size={32} color="var(--accent-red)" />
            <span>Explore Movies</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Discover the latest blockbuster releases, timeless sci-fi epics, and high-octane action films.
          </p>
        </div>

        {isAuthenticated && isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            <span>Add New Movie</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search movies by title or genre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-selects">
          {/* Genre Filter */}
          <select
            className="form-select"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="ALL">All Genres</option>
            {genres.filter((g) => g !== 'ALL').map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          {/* Language Filter */}
          <select
            className="form-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="ALL">All Languages</option>
            {languages.filter((l) => l !== 'ALL').map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="default">Default Sort</option>
            <option value="title">Title (A-Z)</option>
            <option value="duration-asc">Duration (Shortest)</option>
            <option value="duration-desc">Duration (Longest)</option>
          </select>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <LoadingState message="Fetching movies from catalog..." />
      ) : error ? (
        <ErrorState
          title="Could Not Load Movies"
          message={error.message}
          endpoint={error.endpoint}
          onRetry={fetchMovies}
        />
      ) : filteredMovies.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No Matching Movies"
          message={
            isAuthenticated && isAdmin
              ? "No movies matched your current search filters. Try clearing filters or add a new movie."
              : "No movies matched your current search filters. Try clearing filters to find movies."
          }
          actionText="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedGenre('ALL');
            setSelectedLanguage('ALL');
            setSortBy('default');
          }}
        />
      ) : (
        <div className="grid-responsive grid-movies">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.movieId} movie={movie} />
          ))}
        </div>
      )}

      {/* Add Movie Modal (Admin Only) */}
      {isAuthenticated && isAdmin && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Movie to Catalog"
          maxWidth="500px"
        >
        <form onSubmit={handleAddMovie}>
          <div className="form-group">
            <label className="form-label" htmlFor="movie-title">
              Movie Title *
            </label>
            <input
              id="movie-title"
              type="text"
              className="form-input"
              placeholder="e.g. Dune: Part Two"
              value={newMovieData.title}
              onChange={(e) => setNewMovieData({ ...newMovieData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="movie-genre">
              Genre *
            </label>
            <input
              id="movie-genre"
              type="text"
              className="form-input"
              placeholder="e.g. Sci-Fi, Action, Thriller"
              value={newMovieData.genre}
              onChange={(e) => setNewMovieData({ ...newMovieData, genre: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="movie-duration">
              Duration (in minutes) *
            </label>
            <input
              id="movie-duration"
              type="number"
              min="1"
              max="500"
              className="form-input"
              placeholder="e.g. 165"
              value={newMovieData.durationMinutes}
              onChange={(e) => setNewMovieData({ ...newMovieData, durationMinutes: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="movie-lang">
              Language *
            </label>
            <input
              id="movie-lang"
              type="text"
              className="form-input"
              placeholder="e.g. English, Tamil, Hindi"
              value={newMovieData.language}
              onChange={(e) => setNewMovieData({ ...newMovieData, language: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Add Movie'}
            </button>
          </div>
        </form>
      </Modal>
      )}
    </div>
  );
};

export default Movies;
