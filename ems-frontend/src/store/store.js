import { configureStore } from '@reduxjs/toolkit';
import authReducer, { tokenRefreshed, sessionExpired } from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import employeeReducer from './slices/employeeSlice';
import departmentReducer from './slices/departmentSlice';
import attendanceReducer from './slices/attendanceSlice';
import leaveReducer from './slices/leaveSlice';
import payrollReducer from './slices/payrollSlice';
import notificationReducer from './slices/notificationSlice';
import { registerAuthHooks } from '../api/axiosInstance';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    employees: employeeReducer,
    departments: departmentReducer,
    attendance: attendanceReducer,
    leave: leaveReducer,
    payroll: payrollReducer,
    notifications: notificationReducer,
  },
});

// Wire the axios instance to read the current token and dispatch on refresh/expiry,
// without axiosInstance.js importing the store directly (avoids a circular import).
registerAuthHooks({
  getToken: () => store.getState().auth.accessToken,
  onRefreshed: (payload) => store.dispatch(tokenRefreshed(payload)),
  onRefreshFail: () => store.dispatch(sessionExpired()),
});

export default store;
