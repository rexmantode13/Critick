import axiosClient from './axiosClient';

export const reviewApi = {
  getReviews: (params) => axiosClient.get('/reviews', { params }),
  getTitleReviews: (imdbID, page = 1) => axiosClient.get(`/titles/${imdbID}/reviews?page=${page}`),
  createReview: (data) => axiosClient.post('/reviews', data),
  updateReview: (id, data) => axiosClient.put(`/reviews/${id}`, data),
  deleteReview: (id) => axiosClient.delete(`/reviews/${id}`),
  toggleHelpful: (id) => axiosClient.post(`/reviews/${id}/helpful`),
  getReplies: (id) => axiosClient.get(`/reviews/${id}/replies`),
  addReply: (id, body) => axiosClient.post(`/reviews/${id}/replies`, { body }),
  reportReview: (id, reason) => axiosClient.post(`/reviews/${id}/report`, { reason }),
};
