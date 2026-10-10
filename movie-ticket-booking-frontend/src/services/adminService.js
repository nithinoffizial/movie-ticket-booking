import apiClient from '../api/axios';

export const adminService = {
  // GET /admin/dashboard
  getDashboard: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  // GET /admin/customers
  getAllCustomers: async () => {
    const response = await apiClient.get('/admin/customers');
    return response.data;
  },

  // GET /admin/bookings
  getAllBookings: async () => {
    const response = await apiClient.get('/admin/bookings');
    return response.data;
  },

  // GET /admin/tickets
  getAllTickets: async () => {
    const response = await apiClient.get('/admin/tickets');
    return response.data;
  },

  // GET /admin/seats
  getAllSeats: async (showId) => {
    const url = showId ? `/admin/seats?showId=${showId}` : '/admin/seats';
    const response = await apiClient.get(url);
    return response.data;
  },

  // PATCH /admin/customers/{id}/status
  updateCustomerStatus: async (id, active) => {
    const response = await apiClient.patch(`/admin/customers/${id}/status?active=${active}`);
    return response.data;
  },
};

export default adminService;
