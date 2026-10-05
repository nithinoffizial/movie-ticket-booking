import apiClient from '../api/axios';

export const showService = {
  // GET /shows
  getAllShows: async () => {
    const response = await apiClient.get('/shows');
    return response.data;
  },

  // GET /shows/{id}
  getShowById: async (id) => {
    const response = await apiClient.get(`/shows/${id}`);
    return response.data;
  },

  // POST /shows
  createShow: async (showData) => {
    const response = await apiClient.post('/shows', showData);
    return response.data;
  },

  // PUT /shows/{id}
  updateShow: async (id, showData) => {
    const response = await apiClient.put(`/shows/${id}`, showData);
    return response.data;
  },

  // DELETE /shows/{id}
  deleteShow: async (id) => {
    const response = await apiClient.delete(`/shows/${id}`);
    return response.data;
  },
};

export default showService;
