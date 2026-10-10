import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public & Shared Pages
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieShowSelection from './pages/MovieShowSelection';
import Theatres from './pages/Theatres';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import SeatSelectionPage from './pages/SeatSelectionPage';
import Support from './pages/Support';

// Customer Pages
import MyBookings from './pages/MyBookings';
import MyTickets from './pages/MyTickets';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminSupportDesk from './pages/AdminSupportDesk';
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
    <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>404</h1>
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
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
        <Router>
          <div className="app-container">
            {/* Ambient Lighting Orbs */}
            <div className="ambient-glow-bg" aria-hidden="true">
              <div className="ambient-glow-1" />
              <div className="ambient-glow-2" />
              <div className="ambient-glow-3" />
            </div>

            {/* Navigation Bar */}
            <Navbar />

            {/* Main Views */}
            <main className="main-content">
              <Routes>
                {/* Public / Common Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/movies/:id" element={<MovieShowSelection />} />
                <Route path="/theatres" element={<Theatres />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/shows/:showId/seats" element={<SeatSelectionPage />} />
                <Route path="/support" element={<Support />} />

                {/* Customer Protected Routes */}
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute requiredRole="CUSTOMER">
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-tickets"
                  element={
                    <ProtectedRoute requiredRole="CUSTOMER">
                      <MyTickets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute requiredRole="CUSTOMER">
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/customers"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <Customers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/movies"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <Movies />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/theatres"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <Theatres />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/shows"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/bookings"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/tickets"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/support"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminSupportDesk />
                    </ProtectedRoute>
                  }
                />

                {/* Direct Bookings and Customers views (Admin protected) */}
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <Bookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <Customers />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
  );
}

export default App;
