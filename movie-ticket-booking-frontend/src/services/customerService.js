import apiClient from '../api/axios';

export const customerService = {
  // GET /customers
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

  // DELETE /customers/{id}
  deleteCustomer: async (id) => {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  },
};

export default customerService;
