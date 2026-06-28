import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES } from './routePaths';
import { ADMIN_ROLES } from '../utils/constants';

import LoginPage from '../features/auth/LoginPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
import ForbiddenPage from '../features/ForbiddenPage';

import DashboardPage from '../features/dashboard/DashboardPage';
import EmployeeListPage from '../features/employees/EmployeeListPage';
import EmployeeFormPage from '../features/employees/EmployeeFormPage';
import EmployeeProfilePage from '../features/employees/EmployeeProfilePage';
import DepartmentsPage from '../features/departments/DepartmentsPage';
import AttendancePage from '../features/attendance/AttendancePage';
import MyAttendancePage from '../features/attendance/MyAttendancePage';
import LeavePage from '../features/leave/LeavePage';
import MyLeavePage from '../features/leave/MyLeavePage';
import PayrollPage from '../features/payroll/PayrollPage';
import MyPayslipsPage from '../features/payroll/MyPayslipsPage';
import HolidaysPage from '../features/holidays/HolidaysPage';
import NoticesPage from '../features/notices/NoticesPage';
import PerformancePage from '../features/performance/PerformancePage';
import ReportsPage from '../features/reports/ReportsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      </Route>

      {/* Authenticated routes — any role */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.NOTICES} element={<NoticesPage />} />
          <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />

          {/* Employee self-service */}
          <Route path={ROUTES.MY_PROFILE} element={<EmployeeProfilePage />} />
          <Route path={ROUTES.MY_ATTENDANCE} element={<MyAttendancePage />} />
          <Route path={ROUTES.MY_LEAVE} element={<MyLeavePage />} />
          <Route path={ROUTES.MY_PAYSLIPS} element={<MyPayslipsPage />} />
        </Route>
      </Route>

      {/* Admin-only routes (SUPER_ADMIN, HR_MANAGER) */}
      <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.EMPLOYEES} element={<EmployeeListPage />} />
          <Route path={ROUTES.EMPLOYEE_NEW} element={<EmployeeFormPage />} />
          <Route path={ROUTES.EMPLOYEE_EDIT} element={<EmployeeFormPage />} />
          <Route path={ROUTES.EMPLOYEE_DETAIL} element={<EmployeeProfilePage />} />
          <Route path={ROUTES.DEPARTMENTS} element={<DepartmentsPage />} />
          <Route path={ROUTES.ATTENDANCE} element={<AttendancePage />} />
          <Route path={ROUTES.LEAVE} element={<LeavePage />} />
          <Route path={ROUTES.PAYROLL} element={<PayrollPage />} />
          <Route path={ROUTES.HOLIDAYS} element={<HolidaysPage />} />
          <Route path={ROUTES.PERFORMANCE} element={<PerformancePage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}
