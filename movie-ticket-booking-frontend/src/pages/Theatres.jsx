import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Building2, Search, Plus } from 'lucide-react';
import theatreService from '../services/theatreService';
import TheatreCard from '../components/theatres/TheatreCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Theatres = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTheatreData, setNewTheatreData] = useState({
    name: '',
    location: '',
    totalScreens: '',
  });

  const { addToast } = useToast();

  const fetchTheatres = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await theatreService.getAllTheatres();
      setTheatres(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching theatres:', err);
      setError({
        message: err.message || 'Unable to load partner theatres.',
        endpoint: 'GET /theatres',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    theatreService.getAllTheatres()
      .then((data) => {
        if (active) setTheatres(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) {
          console.error('Error fetching theatres:', err);
          setError({
            message: err.message || 'Unable to load partner theatres.',
            endpoint: 'GET /theatres',
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

  const filteredTheatres = useMemo(() => {
    return theatres.filter((theatre) => {
      const term = searchTerm.toLowerCase();
      return (
        theatre.name?.toLowerCase().includes(term) ||
        theatre.location?.toLowerCase().includes(term)
      );
    });
  }, [theatres, searchTerm]);

  const handleAddTheatre = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !isAdmin) {
      addToast('Administrator privileges required to register theatres.', 'error');
      return;
    }
    if (!newTheatreData.name.trim()) {
      addToast('Please enter the theatre name', 'error');
      return;
    }
    if (!newTheatreData.location.trim()) {
      addToast('Please enter the location', 'error');
      return;
    }
    const screens = parseInt(newTheatreData.totalScreens, 10);
    if (isNaN(screens) || screens <= 0) {
      addToast('Please enter a valid screen count', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await theatreService.createTheatre({
        name: newTheatreData.name.trim(),
        location: newTheatreData.location.trim(),
        totalScreens: screens,
      });
      addToast(`Theatre "${newTheatreData.name}" registered successfully!`, 'success');
      setIsAddModalOpen(false);
      setNewTheatreData({ name: '', location: '', totalScreens: '' });
      fetchTheatres();
    } catch (err) {
      console.error('Failed to register theatre:', err);
      addToast(err.message || 'Failed to register theatre', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="section-header">
        <div className="section-title-wrap">
          <span className="section-subtitle">Cinema Venues</span>
          <h1 className="section-title">
            <Building2 size={32} color="var(--accent-gold)" />
            <span>Partner Theatres</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Experience the latest films at world-class multiplexes equipped with Dolby Atmos and 4K projection.
          </p>
        </div>

        {isAuthenticated && isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            <span>Add New Theatre</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search theatres by name or city/location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Showing {filteredTheatres.length} {filteredTheatres.length === 1 ? 'venue' : 'venues'}
        </div>
      </div>

      {/* Theatres Grid */}
      {loading ? (
        <LoadingState message="Fetching partner theatres..." />
      ) : error ? (
        <ErrorState
          title="Could Not Load Theatres"
          message={error.message}
          endpoint={error.endpoint}
          onRetry={fetchTheatres}
        />
      ) : filteredTheatres.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Theatres Found"
          message="No partner theatres match your search criteria."
          actionText="Clear Search"
          onAction={() => setSearchTerm('')}
        />
      ) : (
        <div className="grid-responsive">
          {filteredTheatres.map((theatre) => (
            <TheatreCard key={theatre.theatreId} theatre={theatre} />
          ))}
        </div>
      )}

      {/* Add Theatre Modal */}
      {isAuthenticated && isAdmin && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Register Partner Theatre"
          maxWidth="500px"
        >
          <form onSubmit={handleAddTheatre}>
            <div className="form-group">
              <label className="form-label" htmlFor="theatre-name">
                Theatre Name *
              </label>
              <input
                id="theatre-name"
                type="text"
                className="form-input"
                placeholder="e.g. INOX Megaplex"
                value={newTheatreData.name}
                onChange={(e) => setNewTheatreData({ ...newTheatreData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="theatre-location">
                Location / City *
              </label>
              <input
                id="theatre-location"
                type="text"
                className="form-input"
                placeholder="e.g. Velachery, Chennai"
                value={newTheatreData.location}
                onChange={(e) => setNewTheatreData({ ...newTheatreData, location: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="theatre-screens">
                Total Screens *
              </label>
              <input
                id="theatre-screens"
                type="number"
                min="1"
                max="50"
                className="form-input"
                placeholder="e.g. 6"
                value={newTheatreData.totalScreens}
                onChange={(e) => setNewTheatreData({ ...newTheatreData, totalScreens: e.target.value })}
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
                {isSubmitting ? 'Registering...' : 'Register Theatre'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Theatres;
