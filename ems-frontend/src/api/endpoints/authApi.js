import axiosInstance from '../axiosInstance';

const authApi = {
  login: (usernameOrEmail, password) =>
    axiosInstance.post('/auth/login', { usernameOrEmail, password }),

  refresh: () => axiosInstance.post('/auth/refresh'),

  logout: () => axiosInstance.post('/auth/logout'),

  changePassword: (currentPassword, newPassword) =>
    axiosInstance.put('/auth/change-password', { currentPassword, newPassword }),

  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),

  resetPassword: (token, newPassword) =>
    axiosInstance.post('/auth/reset-password', { token, newPassword }),
};

export default authApi;
