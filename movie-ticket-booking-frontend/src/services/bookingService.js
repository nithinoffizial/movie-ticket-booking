import apiClient from '../api/axios';

export const bookingService = {
  // GET /customer/bookings (for authenticated customer)
  getMyBookings: async () => {
    const response = await apiClient.get('/customer/bookings');
    return response.data;
  },

  // GET /bookings or /admin/bookings (for admin)
  getAllBookings: async () => {
    const response = await apiClient.get('/admin/bookings');
    return response.data;
  },

  // GET /bookings/{id}
  getBookingById: async (id) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  // POST /bookings
  // Payload: { showId: number, seatNumbers: string[], customerId?: number }
  createBooking: async (bookingData) => {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data;
  },
};

export default bookingService;
