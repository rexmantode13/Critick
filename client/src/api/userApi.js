import axiosClient from './axiosClient';

export const userApi = {
  getUserProfile: (username) => axiosClient.get(`/users/${username}`),
  updateProfile: (data) => axiosClient.patch('/users/me', data),
  getActivity: () => axiosClient.get('/users/me/activity'),
  toggleFavourite: (data) => axiosClient.post('/favourites', data),
  demoUpgradePlan: (plan) => axiosClient.post('/billing/demo-upgrade', { plan }),
};
