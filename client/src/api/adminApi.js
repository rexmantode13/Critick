import axiosClient from './axiosClient';

export const adminApi = {
  getUsers: () => axiosClient.get('/admin/users'),
  updateUserRole: (userId, role) => axiosClient.patch(`/admin/users/${userId}/role`, { role }),
  getReports: () => axiosClient.get('/admin/reports'),
  deleteReview: (reviewId) => axiosClient.delete(`/admin/reviews/${reviewId}`),
};
