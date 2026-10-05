import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import { ToastProvider } from './context/ToastContext';
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieShowSelection from './pages/MovieShowSelection';
import Theatres from './pages/Theatres';
import Booking from './pages/Booking';
import Bookings from './pages/Bookings';
import Customers from './pages/Customers';
import { Film, Home as HomeIcon } from 'lucide-react';

// 404 Fallback Page
const NotFound = () => (
  <div className="page-wrapper" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
    <div
      style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'rgba(229, 9, 20, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem',
        color: 'var(--accent-red)',
      }}
    >
      <Film size={36} />
    </div>
    <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', color: '#ffffff' }}>404</h1>
    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
      Scene Not Found
    </h2>
    <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 2rem' }}>
      The movie page or route you are looking for does not exist or has been relocated.
    </p>
    <Link to="/" className="btn btn-primary btn-md">
      <HomeIcon size={18} />
      <span>Return to Home</span>
    </Link>
  </div>
);

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="app-container">
          {/* Ambient Lighting Orbs */}
          <div className="ambient-glow-bg" aria-hidden="true">
            <div className="ambient-glow-1" />
            <div className="ambient-glow-2" />
          </div>

          {/* Navigation Bar */}
          <Navbar />

          {/* Main Views */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movies/:id" element={<MovieShowSelection />} />
              <Route path="/theatres" element={<Theatres />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
