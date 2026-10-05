import apiClient from '../api/axios';

export const movieService = {
  // GET /movies
  getAllMovies: async () => {
    const response = await apiClient.get('/movies');
    return response.data;
  },

  // GET /movies/{id}
  getMovieById: async (id) => {
    const response = await apiClient.get(`/movies/${id}`);
    return response.data;
  },

  // POST /movies
  createMovie: async (movieData) => {
    const response = await apiClient.post('/movies', movieData);
    return response.data;
  },

  // PUT /movies/{id}
  updateMovie: async (id, movieData) => {
    const response = await apiClient.put(`/movies/${id}`, movieData);
    return response.data;
  },

  // DELETE /movies/{id}
  deleteMovie: async (id) => {
    const response = await apiClient.delete(`/movies/${id}`);
    return response.data;
  },
};

export default movieService;
