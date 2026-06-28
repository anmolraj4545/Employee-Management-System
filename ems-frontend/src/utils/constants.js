// Central place for app-wide constants so nothing is hardcoded in multiple files.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER];

// Only UI preferences go in localStorage — never tokens (access token lives in Redux memory,
// refresh token lives in an httpOnly cookie set by the backend).
export const STORAGE_KEYS = {
  THEME_MODE: 'ems_theme_mode',
  SIDEBAR_COLLAPSED: 'ems_sidebar_collapsed',
};

export const LEAVE_STATUS_COLORS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
};

export const ATTENDANCE_STATUS_COLORS = {
  PRESENT: 'success',
  ABSENT: 'error',
  LEAVE: 'info',
  HOLIDAY: 'default',
  HALF_DAY: 'warning',
};

export const EMPLOYEE_STATUS_COLORS = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  TERMINATED: 'error',
  ON_LEAVE: 'info',
};
