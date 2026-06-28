import axiosInstance from '../axiosInstance';

const employeeApi = {
  getAll: (params) => axiosInstance.get('/employees', { params }),
  getById: (id) => axiosInstance.get(`/employees/${id}`),
  getOwnProfile: () => axiosInstance.get('/employees/me'),
  create: (payload) => axiosInstance.post('/employees', payload),
  update: (id, payload) => axiosInstance.put(`/employees/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/employees/${id}`),
  getDropdown: () => axiosInstance.get('/employees/dropdown'),
  updatePhoto: (id, photoUrl) =>
    axiosInstance.put(`/employees/${id}/photo`, null, { params: { photoUrl } }),
};

export default employeeApi;
