import axiosClient from './axiosClient';

export const authApi = {
  register: (data) => axiosClient.post('/auth/register', data),
  login: (data) => axiosClient.post('/auth/login', data),
  logout: () => axiosClient.post('/auth/logout'),
  getMe: () => axiosClient.get('/auth/me'),
  forgotPassword: (email) => axiosClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => axiosClient.post(`/auth/reset-password/${token}`, { password }),
};
