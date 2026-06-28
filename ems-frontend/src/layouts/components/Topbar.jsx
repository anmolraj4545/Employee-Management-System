import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { FiMenu, FiSun, FiMoon, FiLogOut, FiUser } from 'react-icons/fi';
import { toggleTheme } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import useAuth from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';
import { ROUTES } from '../../routes/routePaths';
import { DRAWER_WIDTH } from './Sidebar';

export default function Topbar({ onMobileMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const themeMode = useSelector((state) => state.ui.themeMode);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    setAnchorEl(null);
    await dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(8px)',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          edge="start"
          onClick={onMobileMenuClick}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          aria-label="Open menu"
        >
          <FiMenu size={20} />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          <IconButton onClick={() => dispatch(toggleTheme())} aria-label="Toggle theme">
            {themeMode === 'light' ? <FiMoon size={19} /> : <FiSun size={19} />}
          </IconButton>
        </Tooltip>

        <NotificationBell />

        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }}>
          <Avatar sx={{ width: 34, height: 34, fontSize: '0.875rem', bgcolor: 'primary.main' }}>
            {initials}
          </Avatar>
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {isAdmin ? user?.role?.replace('_', ' ') : 'Employee'}
            </Typography>
          </Box>
          <Divider />
          {!isAdmin && (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate(ROUTES.MY_PROFILE);
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <FiUser size={16} /> <span>My Profile</span>
              </Stack>
            </MenuItem>
          )}
          <MenuItem onClick={handleLogout}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <FiLogOut size={16} /> <span>Log out</span>
            </Stack>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
