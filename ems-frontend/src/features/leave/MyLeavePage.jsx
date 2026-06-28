import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FiPlus, FiX } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  applyLeave,
  fetchMyLeaveRequests,
  fetchMyLeaveBalance,
  fetchLeaveTypes,
} from '../../store/slices/leaveSlice';
import leaveApi from '../../api/endpoints/leaveApi';
import { LEAVE_STATUS_COLORS } from '../../utils/constants';

const schema = yup.object({
  leaveTypeId: yup.string().required('Leave type is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup
    .string()
    .required('End date is required')
    .test('after-start', 'End date must be on or after start date', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return true;
      return new Date(value) >= new Date(startDate);
    }),
  reason: yup.string().max(500).nullable(),
});

export default function MyLeavePage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { myRequests, myBalance, leaveTypes, status } = useSelector((state) => state.leave);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { leaveTypeId: '', startDate: '', endDate: '', reason: '' },
  });

  useEffect(() => {
    dispatch(fetchMyLeaveRequests());
    dispatch(fetchMyLeaveBalance());
    dispatch(fetchLeaveTypes());
  }, [dispatch]);

  const openDialog = () => {
    reset({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
    setDialogOpen(true);
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    const result = await dispatch(applyLeave(values));
    setSubmitting(false);
    if (applyLeave.fulfilled.match(result)) {
      enqueueSnackbar('Leave request submitted', { variant: 'success' });
      setDialogOpen(false);
      dispatch(fetchMyLeaveBalance());
    } else {
      enqueueSnackbar(result.payload || 'Failed to submit leave request', { variant: 'error' });
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await leaveApi.cancel(cancelTarget.id);
      enqueueSnackbar('Leave request cancelled', { variant: 'success' });
      dispatch(fetchMyLeaveRequests());
      dispatch(fetchMyLeaveBalance());
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to cancel request', { variant: 'error' });
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  const columns = [
    { key: 'leaveTypeName', label: 'Type' },
    { key: 'startDate', label: 'Start' },
    { key: 'endDate', label: 'End' },
    { key: 'totalDays', label: 'Days' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Chip label={row.status} size="small" color={LEAVE_STATUS_COLORS[row.status] || 'default'} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        row.status === 'PENDING' ? (
          <Button size="small" color="error" startIcon={<FiX size={13} />} onClick={() => setCancelTarget(row)}>
            Cancel
          </Button>
        ) : null,
    },
  ];

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Stack spacing={0.25}>
          <Typography variant="h5" fontWeight={700}>
            My Leave
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Apply for leave and track your requests
          </Typography>
        </Stack>
        <Button variant="contained" startIcon={<FiPlus size={16} />} onClick={openDialog}>
          Apply for Leave
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {myBalance.map((b) => (
          <Grid key={b.leaveTypeId} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
                backdropFilter: 'blur(20px)',
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)'),
              }}
            >
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {b.leaveTypeName}
              </Typography>
              <Typography variant="h5" fontWeight={700} className="tabular-nums">
                {b.remainingDays}
                <Typography component="span" variant="body2" color="text.secondary">
                  {' '}
                  / {b.totalDays} days left
                </Typography>
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <DataTable columns={columns} rows={myRequests} loading={status === 'loading'} emptyMessage="You haven't applied for any leave yet" />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogTitle sx={{ fontWeight: 700 }}>Apply for Leave</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Controller
                name="leaveTypeId"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Leave Type" fullWidth error={Boolean(errors.leaveTypeId)} helperText={errors.leaveTypeId?.message}>
                    {leaveTypes.map((t) => (
                      <MenuItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...register('startDate')}
                  error={Boolean(errors.startDate)}
                  helperText={errors.startDate?.message}
                />
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...register('endDate')}
                  error={Boolean(errors.endDate)}
                  helperText={errors.endDate?.message}
                />
              </Stack>
              <TextField
                label="Reason (optional)"
                fullWidth
                multiline
                rows={3}
                {...register('reason')}
                error={Boolean(errors.reason)}
                helperText={errors.reason?.message}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Request'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel this leave request?"
        description="If this request was already approved, your leave balance will be restored."
        confirmLabel="Cancel Request"
        destructive
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </Stack>
  );
}
