import apiClient from '../api/axios';

export const supportService = {
  // ==========================================
  // CUSTOMER SUPPORT ENDPOINTS
  // ==========================================

  // POST /support/tickets — create a support ticket
  createTicket: async (ticketData) => {
    const response = await apiClient.post('/support/tickets', ticketData);
    return response.data;
  },

  // GET /support/tickets — list customer's tickets
  getMyTickets: async () => {
    const response = await apiClient.get('/support/tickets');
    return response.data;
  },

  // GET /support/tickets/{id} — view owned ticket with full conversation
  getTicketDetail: async (ticketId) => {
    const response = await apiClient.get(`/support/tickets/${ticketId}`);
    return response.data;
  },

  // POST /support/tickets/{id}/messages — reply to an owned ticket
  replyToTicket: async (ticketId, message) => {
    const response = await apiClient.post(`/support/tickets/${ticketId}/messages`, { message });
    return response.data;
  },

  // PATCH /support/tickets/{id}/close — close an owned ticket
  closeTicket: async (ticketId) => {
    const response = await apiClient.patch(`/support/tickets/${ticketId}/close`);
    return response.data;
  },

  // ==========================================
  // ADMINISTRATOR SUPPORT DESK ENDPOINTS
  // ==========================================

  // GET /admin/support/tickets — list and filter support tickets
  getAdminTickets: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'ALL') {
      params.append('status', filters.status);
    }
    if (filters.category && filters.category !== 'ALL') {
      params.append('category', filters.category);
    }
    if (filters.search && filters.search.trim()) {
      params.append('search', filters.search.trim());
    }

    const queryString = params.toString();
    const url = queryString ? `/admin/support/tickets?${queryString}` : '/admin/support/tickets';
    const response = await apiClient.get(url);
    return response.data;
  },

  // GET /admin/support/tickets/{id} — view ticket and full conversation
  getAdminTicketDetail: async (ticketId) => {
    const response = await apiClient.get(`/admin/support/tickets/${ticketId}`);
    return response.data;
  },

  // POST /admin/support/tickets/{id}/messages — reply to customer
  adminReply: async (ticketId, message) => {
    const response = await apiClient.post(`/admin/support/tickets/${ticketId}/messages`, { message });
    return response.data;
  },

  // Compatible alias for adminReply
  adminReplyTicket: async (ticketId, message) => {
    return supportService.adminReply(ticketId, message);
  },

  // PATCH /admin/support/tickets/{id}/status — update ticket status
  adminUpdateStatus: async (ticketId, status) => {
    const response = await apiClient.patch(`/admin/support/tickets/${ticketId}/status`, { status });
    return response.data;
  },

  // Compatible alias for adminUpdateStatus
  adminUpdateTicketStatus: async (ticketId, status) => {
    return supportService.adminUpdateStatus(ticketId, status);
  },
};

export default supportService;
