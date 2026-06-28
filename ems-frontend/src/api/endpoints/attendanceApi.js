import axiosInstance from '../axiosInstance';

const attendanceApi = {
  checkIn: () => axiosInstance.post('/attendance/check-in'),
  checkOut: () => axiosInstance.post('/attendance/check-out'),
  getOwnHistory: (params) => axiosInstance.get('/attendance/me', { params }),
  getEmployeeHistory: (employeeId, params) =>
    axiosInstance.get(`/attendance/employee/${employeeId}`, { params }),
  manualUpdate: (id, payload) => axiosInstance.put(`/attendance/${id}`, payload),
  getReport: (params) => axiosInstance.get('/attendance/report', { params }),
  getTodaySummary: () => axiosInstance.get('/attendance/summary/today'),
};

export default attendanceApi;
