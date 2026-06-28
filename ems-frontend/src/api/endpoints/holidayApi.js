import axiosInstance from '../axiosInstance';

const holidayApi = {
  getAll: (params) => axiosInstance.get('/holidays', { params }),
  create: (payload) => axiosInstance.post('/holidays', payload),
  update: (id, payload) => axiosInstance.put(`/holidays/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/holidays/${id}`),
};

export default holidayApi;
