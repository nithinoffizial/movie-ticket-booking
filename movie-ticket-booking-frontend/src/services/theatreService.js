import apiClient from '../api/axios';

export const theatreService = {
  // GET /theatres
  getAllTheatres: async () => {
    const response = await apiClient.get('/theatres');
    return response.data;
  },

  // GET /theatres/{id}
  getTheatreById: async (id) => {
    const response = await apiClient.get(`/theatres/${id}`);
    return response.data;
  },

  // POST /theatres
  createTheatre: async (theatreData) => {
    const response = await apiClient.post('/theatres', theatreData);
    return response.data;
  },

  // PUT /theatres/{id}
  updateTheatre: async (id, theatreData) => {
    const response = await apiClient.put(`/theatres/${id}`, theatreData);
    return response.data;
  },

  // DELETE /theatres/{id}
  deleteTheatre: async (id) => {
    const response = await apiClient.delete(`/theatres/${id}`);
    return response.data;
  },
};

export default theatreService;
