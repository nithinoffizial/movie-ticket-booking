import apiClient from '../api/axios';

export const customerService = {
  // GET /customer/profile (customer own profile)
  getProfile: async () => {
    const response = await apiClient.get('/customer/profile');
    return response.data;
  },

  // GET /customers (admin only)
  getAllCustomers: async () => {
    const response = await apiClient.get('/customers');
    return response.data;
  },

  // GET /customers/{id}
  getCustomerById: async (id) => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  // POST /customers
  createCustomer: async (customerData) => {
    const response = await apiClient.post('/customers', customerData);
    return response.data;
  },

  // PUT /customers/{id}
  updateCustomer: async (id, customerData) => {
    const response = await apiClient.put(`/customers/${id}`, customerData);
    return response.data;
  },

  // PATCH /customers/{id}/status
  updateCustomerStatus: async (id, active) => {
    const response = await apiClient.patch(`/customers/${id}/status?active=${active}`);
    return response.data;
  },

  // DELETE /customers/{id}
  deleteCustomer: async (id) => {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  },
};

export default customerService;
