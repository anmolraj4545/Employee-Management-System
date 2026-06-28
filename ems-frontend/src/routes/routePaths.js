export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  EMPLOYEES: '/employees',
  EMPLOYEE_NEW: '/employees/new',
  EMPLOYEE_DETAIL: '/employees/:id',
  EMPLOYEE_EDIT: '/employees/:id/edit',
  MY_PROFILE: '/my-profile',
  ATTENDANCE: '/attendance',
  MY_ATTENDANCE: '/my-attendance',
  LEAVE: '/leave',
  MY_LEAVE: '/my-leave',
  PAYROLL: '/payroll',
  MY_PAYSLIPS: '/my-payslips',
  DEPARTMENTS: '/departments',
  HOLIDAYS: '/holidays',
  NOTICES: '/notices',
  PERFORMANCE: '/performance',
  REPORTS: '/reports',
  FORBIDDEN: '/forbidden',
};

export function employeeDetailPath(id) {
  return `/employees/${id}`;
}
