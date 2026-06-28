import axiosInstance from '../axiosInstance';

const performanceApi = {
  createReview: (payload) => axiosInstance.post('/performance/reviews', payload),
  getEmployeeReviews: (employeeId) => axiosInstance.get(`/performance/employee/${employeeId}`),
  getMyReviews: () => axiosInstance.get('/performance/me'),
};

export default performanceApi;
