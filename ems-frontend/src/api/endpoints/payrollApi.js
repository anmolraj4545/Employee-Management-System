import axiosInstance from '../axiosInstance';

const payrollApi = {
  setSalaryStructure: (payload) => axiosInstance.post('/payroll/salary-structure', payload),
  getSalaryStructure: (employeeId) => axiosInstance.get(`/payroll/salary-structure/${employeeId}`),
  generatePayroll: (payload) => axiosInstance.post('/payroll/generate', payload),
  markPaid: (payslipId) => axiosInstance.put(`/payroll/payslips/${payslipId}/mark-paid`),
  getMyPayslips: () => axiosInstance.get('/payroll/payslips/me'),
  getEmployeeHistory: (employeeId) => axiosInstance.get(`/payroll/employee/${employeeId}/history`),
  getMonthlyPayroll: (params) => axiosInstance.get('/payroll/monthly', { params }),
  getMonthlySummary: (month, year) =>
    axiosInstance.get('/payroll/monthly/summary', { params: { month, year } }),
  downloadPayslipPdf: (payslipId) =>
    axiosInstance.get(`/payroll/payslips/${payslipId}/pdf`, { responseType: 'blob' }),
};

export default payrollApi;
