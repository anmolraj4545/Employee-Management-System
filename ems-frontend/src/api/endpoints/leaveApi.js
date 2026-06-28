import axiosInstance from '../axiosInstance';

const leaveApi = {
  apply: (payload) => axiosInstance.post('/leaves/apply', payload),
  approve: (id) => axiosInstance.put(`/leaves/${id}/approve`),
  reject: (id, rejectionReason) => axiosInstance.put(`/leaves/${id}/reject`, { rejectionReason }),
  cancel: (id) => axiosInstance.put(`/leaves/${id}/cancel`),
  getMine: () => axiosInstance.get('/leaves/me'),
  getMyBalance: (year) => axiosInstance.get('/leaves/balance', { params: { year } }),
  getEmployeeBalance: (employeeId, year) =>
    axiosInstance.get(`/leaves/employee/${employeeId}/balance`, { params: { year } }),
  getPending: (params) => axiosInstance.get('/leaves/pending', { params }),
  search: (params) => axiosInstance.get('/leaves', { params }),
  getLeaveTypes: () => axiosInstance.get('/leave-types'),
};

export default leaveApi;
