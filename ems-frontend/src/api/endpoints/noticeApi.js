import axiosInstance from '../axiosInstance';

const noticeApi = {
  getAll: (params) => axiosInstance.get('/notices', { params }),
  create: (payload) => axiosInstance.post('/notices', payload),
  update: (id, payload) => axiosInstance.put(`/notices/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/notices/${id}`),
};

export default noticeApi;
