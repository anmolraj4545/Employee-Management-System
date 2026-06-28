import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import { FiBell } from 'react-icons/fi';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../store/slices/notificationSlice';

const POLL_INTERVAL_MS = 30000;

export default function NotificationBell() {
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector((state) => state.notifications);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    dispatch(fetchNotifications({ size: 8 }));
  };

  const handleClose = () => setAnchorEl(null);

  const handleItemClick = (notification) => {
    if (!notification.read) {
      dispatch(markNotificationRead(notification.id));
    }
  };

  return (
    <>
      <IconButton onClick={handleOpen} aria-label="Notifications">
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <FiBell size={20} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 480, borderRadius: 3 } } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={() => dispatch(markAllNotificationsRead())}>
              Mark all read
            </Button>
          )}
        </Stack>
        <Divider />

        {items.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              You're all caught up.
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {items.map((n) => (
              <ListItemButton
                key={n.id}
                onClick={() => handleItemClick(n)}
                sx={{
                  alignItems: 'flex-start',
                  backgroundColor: n.read ? 'transparent' : 'action.hover',
                }}
              >
                <ListItemText
                  primary={n.title}
                  secondary={n.message}
                  slotProps={{
                    primary: { fontSize: '0.875rem', fontWeight: n.read ? 500 : 700 },
                    secondary: { fontSize: '0.8125rem', sx: { mt: 0.25 } },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
