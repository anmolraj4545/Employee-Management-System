import { useSelector } from 'react-redux';
import { ADMIN_ROLES } from '../utils/constants';

export default function useAuth() {
  const { accessToken, user, initializing } = useSelector((state) => state.auth);

  return {
    isAuthenticated: Boolean(accessToken && user),
    user,
    initializing,
    isAdmin: user ? ADMIN_ROLES.includes(user.role) : false,
    role: user?.role || null,
    employeeId: user?.employeeId || null,
  };
}
