import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import {
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FiClock, FiLogIn, FiLogOut } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import DataTable from '../../components/DataTable';
import { checkIn, checkOut, fetchMyAttendance } from '../../store/slices/attendanceSlice';
import { ATTENDANCE_STATUS_COLORS } from '../../utils/constants';

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

export default function MyAttendancePage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { myHistory, status } = useSelector((state) => state.attendance);

  const [actionLoading, setActionLoading] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    dispatch(fetchMyAttendance({ start: start || undefined, end: end || undefined }));
  }, [dispatch, start, end]);

  const todayRecord = myHistory.find((a) => a.attendanceDate === todayKey());
  const hasCheckedIn = Boolean(todayRecord?.checkInTime);
  const hasCheckedOut = Boolean(todayRecord?.checkOutTime);

  const handleCheckIn = async () => {
    setActionLoading(true);
    const result = await dispatch(checkIn());
    setActionLoading(false);
    if (checkIn.fulfilled.match(result)) {
      enqueueSnackbar('Checked in successfully', { variant: 'success' });
    } else {
      enqueueSnackbar(result.payload || 'Check-in failed', { variant: 'error' });
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    const result = await dispatch(checkOut());
    setActionLoading(false);
    if (checkOut.fulfilled.match(result)) {
      enqueueSnackbar('Checked out successfully', { variant: 'success' });
    } else {
      enqueueSnackbar(result.payload || 'Check-out failed', { variant: 'error' });
    }
  };

  const columns = [
    { key: 'attendanceDate', label: 'Date' },
    {
      key: 'checkInTime',
      label: 'Check In',
      render: (row) => (row.checkInTime ? format(parseISO(row.checkInTime), 'hh:mm a') : '—'),
    },
    {
      key: 'checkOutTime',
      label: 'Check Out',
      render: (row) => (row.checkOutTime ? format(parseISO(row.checkOutTime), 'hh:mm a') : '—'),
    },
    { key: 'workingHours', label: 'Hours', render: (row) => (row.workingHours != null ? `${row.workingHours}h` : '—') },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Chip label={row.status?.replace('_', ' ')} size="small" color={ATTENDANCE_STATUS_COLORS[row.status] || 'default'} variant="outlined" />
          {row.late && <Chip label="Late" size="small" color="warning" />}
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <Stack spacing={0.25}>
        <Typography variant="h5" fontWeight={700}>
          My Attendance
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Check in and out, and view your attendance history
        </Typography>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          backdropFilter: 'blur(20px)',
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)'),
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <FiClock size={20} />
              <Stack spacing={0}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Today, {format(new Date(), 'MMMM d, yyyy')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasCheckedIn
                    ? `Checked in at ${format(parseISO(todayRecord.checkInTime), 'hh:mm a')}`
                    : "You haven't checked in yet"}
                  {hasCheckedOut && ` · Checked out at ${format(parseISO(todayRecord.checkOutTime), 'hh:mm a')}`}
                </Typography>
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack direction="row" spacing={1.5} justifyContent={{ sm: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<FiLogIn size={16} />}
                onClick={handleCheckIn}
                disabled={hasCheckedIn || actionLoading}
              >
                Check In
              </Button>
              <Button
                variant="outlined"
                startIcon={<FiLogOut size={16} />}
                onClick={handleCheckOut}
                disabled={!hasCheckedIn || hasCheckedOut || actionLoading}
              >
                Check Out
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          label="From"
          type="date"
          size="small"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>

      <DataTable columns={columns} rows={myHistory} loading={status === 'loading'} emptyMessage="No attendance records yet" />
    </Stack>
  );
}
