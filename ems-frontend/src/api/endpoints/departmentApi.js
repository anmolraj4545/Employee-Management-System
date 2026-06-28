import axiosInstance from '../axiosInstance';

const departmentApi = {
  getAll: () => axiosInstance.get('/departments'),
  getById: (id) => axiosInstance.get(`/departments/${id}`),
  create: (payload) => axiosInstance.post('/departments', payload),
  update: (id, payload) => axiosInstance.put(`/departments/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/departments/${id}`),
  getEmployees: (id) => axiosInstance.get(`/departments/${id}/employees`),
  getAnalytics: (id) => axiosInstance.get(`/departments/${id}/analytics`),
};

export default departmentApi;
