import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FiUserCheck, FiUserX, FiClock, FiUsers } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { fetchAttendanceReport, fetchTodaySummary } from '../../store/slices/attendanceSlice';
import { fetchEmployeeDropdown } from '../../store/slices/employeeSlice';
import attendanceApi from '../../api/endpoints/attendanceApi';
import { ATTENDANCE_STATUS_COLORS } from '../../utils/constants';

const STATUS_OPTIONS = ['PRESENT', 'ABSENT', 'LEAVE', 'HOLIDAY', 'HALF_DAY'];

export default function AttendancePage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { report, status, pagination, todaySummary } = useSelector((state) => state.attendance);
  const { dropdown: employees } = useSelector((state) => state.employees);

  const [employeeId, setEmployeeId] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [editTarget, setEditTarget] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchTodaySummary());
    dispatch(fetchEmployeeDropdown());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchAttendanceReport({
        employeeId: employeeId || undefined,
        status: attendanceStatus || undefined,
        start: start || undefined,
        end: end || undefined,
        page,
        size: pageSize,
      })
    );
  }, [dispatch, employeeId, attendanceStatus, start, end, page, pageSize]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(0);
  };

  const openEditDialog = (row) => {
    setEditTarget(row);
    setEditStatus(row.status);
    setEditRemarks(row.remarks || '');
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await attendanceApi.manualUpdate(editTarget.id, { status: editStatus, remarks: editRemarks });
      enqueueSnackbar('Attendance record updated', { variant: 'success' });
      setEditTarget(null);
      dispatch(fetchAttendanceReport({ employeeId: employeeId || undefined, status: attendanceStatus || undefined, start: start || undefined, end: end || undefined, page, size: pageSize }));
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to update record', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      { key: 'employeeName', label: 'Employee', render: (row) => <Typography fontWeight={600}>{row.employeeName}</Typography> },
      { key: 'attendanceDate', label: 'Date' },
      { key: 'checkInTime', label: 'Check In', render: (row) => (row.checkInTime ? format(parseISO(row.checkInTime), 'hh:mm a') : '—') },
      { key: 'checkOutTime', label: 'Check Out', render: (row) => (row.checkOutTime ? format(parseISO(row.checkOutTime), 'hh:mm a') : '—') },
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
      {
        key: 'actions',
        label: '',
        align: 'right',
        render: (row) => (
          <Button size="small" onClick={() => openEditDialog(row)}>
            Edit
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <Stack spacing={3}>
      <Stack spacing={0.25}>
        <Typography variant="h5" fontWeight={700}>
          Attendance
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Today's attendance overview and full history
        </Typography>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Present Today" value={todaySummary?.presentCount ?? 0} icon={FiUserCheck} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Absent Today" value={todaySummary?.absentCount ?? 0} icon={FiUserX} color="error" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Late Today" value={todaySummary?.lateCount ?? 0} icon={FiClock} color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="On Leave Today" value={todaySummary?.onLeaveCount ?? 0} icon={FiUsers} color="info" />
        </Grid>
      </Grid>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
        <TextField select label="Employee" size="small" value={employeeId} onChange={handleFilterChange(setEmployeeId)} sx={{ minWidth: 180 }}>
          <MenuItem value="">All employees</MenuItem>
          {employees.map((e) => (
            <MenuItem key={e.id} value={e.id}>
              {e.fullName}
            </MenuItem>
          ))}
        </TextField>
        <TextField select label="Status" size="small" value={attendanceStatus} onChange={handleFilterChange(setAttendanceStatus)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All statuses</MenuItem>
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {s.replace('_', ' ')}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="From" type="date" size="small" value={start} onChange={handleFilterChange(setStart)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="To" type="date" size="small" value={end} onChange={handleFilterChange(setEnd)} slotProps={{ inputLabel: { shrink: true } }} />
      </Stack>

      <DataTable
        columns={columns}
        rows={report}
        loading={status === 'loading'}
        emptyMessage="No attendance records match your filters"
        page={page}
        pageSize={pageSize}
        totalElements={pagination.totalElements}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <Dialog open={Boolean(editTarget)} onClose={() => setEditTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Attendance Record</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField select label="Status" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} fullWidth>
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Remarks" value={editRemarks} onChange={(e) => setEditRemarks(e.target.value)} fullWidth multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setEditTarget(null)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
