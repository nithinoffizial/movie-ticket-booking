import apiClient from '../api/axios';

export const ticketService = {
  // GET /customer/tickets (for authenticated customer)
  getMyTickets: async () => {
    const response = await apiClient.get('/customer/tickets');
    return response.data;
  },

  // GET /admin/tickets (for admin)
  getAllTickets: async () => {
    const response = await apiClient.get('/admin/tickets');
    return response.data;
  },

  // GET /tickets/{id}
  getTicketById: async (id) => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },
};

export default ticketService;
