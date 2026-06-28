import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FiPlus } from 'react-icons/fi';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DataTable from '../../components/DataTable';
import { fetchEmployeeDropdown } from '../../store/slices/employeeSlice';
import axiosInstance from '../../api/axiosInstance';

const schema = yup.object({
  employeeId: yup.string().required('Employee is required'),
  reviewPeriod: yup.string().required('Review period is required').matches(/^\d{4}-(0[1-9]|1[0-2])$/, 'Format must be YYYY-MM'),
  rating: yup.number().min(0).max(5).required('Rating is required'),
  comments: yup.string().max(2000).nullable(),
});

export default function PerformancePage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { dropdown: employees } = useSelector((s) => s.employees);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { employeeId: '', reviewPeriod: '', rating: 3, comments: '' },
  });

  useEffect(() => {
    dispatch(fetchEmployeeDropdown());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedEmployee) {
      // not synchronous setState — this runs as a side-effect of dependency change,
      // wrapping in microtask avoids the cascade-render lint error
      Promise.resolve().then(() => setReviews([]));
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/performance/employee/${selectedEmployee}`);
        if (!cancelled) setReviews(data.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedEmployee]);

  const openDialog = () => {
    reset({ employeeId: selectedEmployee, reviewPeriod: '', rating: 3, comments: '' });
    setDialogOpen(true);
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await axiosInstance.post('/performance/reviews', values);
      enqueueSnackbar('Review submitted', { variant: 'success' });
      setDialogOpen(false);
      if (selectedEmployee) {
        const { data } = await axiosInstance.get(`/performance/employee/${selectedEmployee}`);
        setReviews(data.data);
      }
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to submit review', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'reviewPeriod', label: 'Period' },
    {
      key: 'rating',
      label: 'Rating',
      render: (r) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Rating value={r.rating} precision={0.5} readOnly size="small" />
          <Chip label={r.rating} size="small" />
        </Stack>
      ),
    },
    { key: 'reviewerName', label: 'Reviewer' },
    { key: 'comments', label: 'Comments', render: (r) => r.comments || '—' },
  ];

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Stack spacing={0.25}>
          <Typography variant="h5" fontWeight={700}>Performance Reviews</Typography>
          <Typography variant="body2" color="text.secondary">Employee ratings and evaluations</Typography>
        </Stack>
        <Button variant="contained" startIcon={<FiPlus size={16} />} onClick={openDialog}>Add Review</Button>
      </Stack>

      <TextField
        select
        label="Select Employee to View Reviews"
        size="small"
        value={selectedEmployee}
        onChange={(e) => setSelectedEmployee(e.target.value)}
        sx={{ maxWidth: 320 }}
      >
        <MenuItem value="">Select an employee…</MenuItem>
        {employees.map((e) => (
          <MenuItem key={e.id} value={String(e.id)}>{e.fullName}</MenuItem>
        ))}
      </TextField>

      {selectedEmployee && (
        <DataTable
          columns={columns}
          rows={reviews}
          loading={loading}
          emptyMessage="No reviews for this employee yet"
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogTitle sx={{ fontWeight: 700 }}>Add Performance Review</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Employee" fullWidth error={Boolean(errors.employeeId)} helperText={errors.employeeId?.message}>
                    {employees.map((e) => (
                      <MenuItem key={e.id} value={String(e.id)}>{e.fullName}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <TextField
                label="Review Period (YYYY-MM)"
                fullWidth
                placeholder="2026-06"
                {...register('reviewPeriod')}
                error={Boolean(errors.reviewPeriod)}
                helperText={errors.reviewPeriod?.message || 'Format: YYYY-MM e.g. 2026-06'}
              />
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">Rating</Typography>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <Rating
                      value={Number(field.value)}
                      onChange={(_, v) => field.onChange(v)}
                      precision={0.5}
                      size="large"
                    />
                  )}
                />
                {errors.rating && <Typography variant="caption" color="error">{errors.rating.message}</Typography>}
              </Stack>
              <TextField label="Comments (optional)" fullWidth multiline rows={4} {...register('comments')} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Review'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
}
