import apiClient from '../api/axios';

export const bookingService = {
  // GET /bookings
  getAllBookings: async () => {
    const response = await apiClient.get('/bookings');
    return response.data;
  },

  // GET /bookings/{id}
  getBookingById: async (id) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  // POST /bookings
  // Payload: { customer: { customerId: number }, show: { showId: number }, seatsBooked: number }
  createBooking: async (bookingData) => {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data;
  },

  // PUT /bookings/{id}
  updateBooking: async (id, bookingData) => {
    const response = await apiClient.put(`/bookings/${id}`, bookingData);
    return response.data;
  },

  // DELETE /bookings/{id}
  deleteBooking: async (id) => {
    const response = await apiClient.delete(`/bookings/${id}`);
    return response.data;
  },
};

export default bookingService;
