import axios from 'axios';

// Centralized Axios instance for Movie Ticket Booking Spring Boot backend
// Uses '/api' so Vite dev server proxies to http://localhost:8081/api without CORS issues
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Interceptor for attaching auth token and logging requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for structured, user-friendly error formatting and auth handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';

    // If unauthorized and not already on the login page, clear token and redirect
    if (status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?expired=true';
    }

    const errorDetails = {
      status,
      message,
      endpoint: `${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      fullError: error,
    };
    console.error('API Error Encountered:', errorDetails);
    return Promise.reject(errorDetails);
  }
);

export default apiClient;
export { API_BASE_URL };
