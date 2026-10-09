import axiosClient from './axiosClient';

export const catalogApi = {
  getTrending: () => axiosClient.get('/titles/trending'),
  getPopular: (limit = 12) => axiosClient.get(`/titles/popular?limit=${limit}`),
  getTopRated: (limit = 12) => axiosClient.get(`/titles/top-rated?limit=${limit}`),
  getHiddenGems: (limit = 12) => axiosClient.get(`/titles/hidden-gems?limit=${limit}`),
  getDiscover: (params) => axiosClient.get('/titles/discover', { params }),
  search: (query) => axiosClient.get(`/titles/search?q=${encodeURIComponent(query)}`),
  getTitleDetails: (imdbID) => axiosClient.get(`/titles/${imdbID}`),
  getSeason: (imdbID, seasonNum) => axiosClient.get(`/titles/${imdbID}/seasons/${seasonNum}`),
  getRecommendations: (imdbID) => axiosClient.get(`/titles/${imdbID}/recommendations`),
  getGenres: () => axiosClient.get('/genres'),
  getStats: () => axiosClient.get('/stats'),
};
