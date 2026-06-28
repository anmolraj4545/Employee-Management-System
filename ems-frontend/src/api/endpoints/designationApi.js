import axiosInstance from '../axiosInstance';

const designationApi = {
  getAll: (departmentId) => axiosInstance.get('/designations', { params: { departmentId } }),
  create: (payload) => axiosInstance.post('/designations', payload),
  update: (id, payload) => axiosInstance.put(`/designations/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/designations/${id}`),
};

export default designationApi;
