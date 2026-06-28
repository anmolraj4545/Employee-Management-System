import axiosInstance from '../axiosInstance';

const notificationApi = {
  getMine: (params) => axiosInstance.get('/notifications/me', { params }),
  getUnreadCount: () => axiosInstance.get('/notifications/me/unread-count'),
  markRead: (id) => axiosInstance.put(`/notifications/${id}/read`),
  markAllRead: () => axiosInstance.put('/notifications/read-all'),
};

export default notificationApi;
