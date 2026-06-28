import axiosInstance from '../axiosInstance';

const dashboardApi = {
  getSummary: () => axiosInstance.get('/dashboard/summary'),
  getAttendanceTrend: (days = 7) => axiosInstance.get('/dashboard/charts/attendance', { params: { days } }),
  getDepartmentDistribution: () => axiosInstance.get('/dashboard/charts/department-distribution'),
};

export default dashboardApi;
