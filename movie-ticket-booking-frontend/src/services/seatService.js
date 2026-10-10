import apiClient from '../api/axios';

export const seatService = {
  getSeatsByShowId: async (showId) => {
    const response = await apiClient.get(`/shows/${showId}/seats`);
    return response.data;
  },
};

export default seatService;
