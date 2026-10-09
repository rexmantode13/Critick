import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized for silent token refresh (except on login/register/refresh endpoints)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        isRefreshing = false;
        processQueue(null);
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        processQueue(refreshErr, null);
        return Promise.reject(error.response?.data || { message: 'Session expired' });
      }
    }

    return Promise.reject(error.response?.data || { message: error.message || 'An unexpected error occurred' });
  }
);

export default axiosClient;
