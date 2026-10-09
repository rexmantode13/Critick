import axiosClient from './axiosClient';

export const watchlistApi = {
  getWatchlist: (status) => axiosClient.get('/watchlist', { params: { status } }),
  addToWatchlist: (data) => axiosClient.post('/watchlist', data),
  updateStatus: (id, status) => axiosClient.patch(`/watchlist/${id}`, { status }),
  removeFromWatchlist: (id) => axiosClient.delete(`/watchlist/${id}`),
};
