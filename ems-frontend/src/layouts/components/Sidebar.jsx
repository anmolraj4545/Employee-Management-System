import { NavLink, useLocation } from 'react-router-dom';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import HiveIcon from '@mui/icons-material/Hive';
import {
  FiGrid,
  FiUsers,
  FiClock,
  FiCalendar,
  FiDollarSign,
  FiBriefcase,
  FiGift,
  FiBell,
  FiAward,
  FiFileText,
  FiUser,
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../routes/routePaths';

const DRAWER_WIDTH = 260;

const adminNav = [
  { label: 'Dashboard', icon: FiGrid, path: ROUTES.DASHBOARD },
  { label: 'Employees', icon: FiUsers, path: ROUTES.EMPLOYEES },
  { label: 'Departments', icon: FiBriefcase, path: ROUTES.DEPARTMENTS },
  { label: 'Attendance', icon: FiClock, path: ROUTES.ATTENDANCE },
  { label: 'Leave', icon: FiCalendar, path: ROUTES.LEAVE },
  { label: 'Payroll', icon: FiDollarSign, path: ROUTES.PAYROLL },
  { label: 'Performance', icon: FiAward, path: ROUTES.PERFORMANCE },
  { label: 'Holidays', icon: FiGift, path: ROUTES.HOLIDAYS },
  { label: 'Notice Board', icon: FiBell, path: ROUTES.NOTICES },
  { label: 'Reports', icon: FiFileText, path: ROUTES.REPORTS },
];

const employeeNav = [
  { label: 'Dashboard', icon: FiGrid, path: ROUTES.DASHBOARD },
  { label: 'My Profile', icon: FiUser, path: ROUTES.MY_PROFILE },
  { label: 'My Attendance', icon: FiClock, path: ROUTES.MY_ATTENDANCE },
  { label: 'My Leave', icon: FiCalendar, path: ROUTES.MY_LEAVE },
  { label: 'My Payslips', icon: FiDollarSign, path: ROUTES.MY_PAYSLIPS },
  { label: 'Notice Board', icon: FiBell, path: ROUTES.NOTICES },
];

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const navItems = isAdmin ? adminNav : employeeNav;

  const content = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ px: 2.5, py: 2.5 }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
            flexShrink: 0,
          }}
        >
          <HiveIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Typography variant="h6" fontWeight={700} noWrap>
          EMS
        </Typography>
      </Stack>

      <List sx={{ flex: 1, px: 1.5, py: 1 }}>
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname.startsWith(path) && path !== '/';
          return (
            <ListItemButton
              key={path}
              component={NavLink}
              to={path}
              onClick={onMobileClose}
              selected={isActive}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                py: 1,
                color: isActive ? 'primary.main' : 'text.secondary',
                '&.Mui-selected': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(79, 70, 229, 0.16)' : 'rgba(79, 70, 229, 0.08)',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(79, 70, 229, 0.22)' : 'rgba(79, 70, 229, 0.12)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                <Icon size={18} />
              </ListItemIcon>
              <ListItemText
                primary={label}
                slotProps={{ primary: { fontSize: '0.875rem', fontWeight: isActive ? 700 : 500 } }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          },
        }}
        open
      >
        {content}
      </Drawer>

      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };
