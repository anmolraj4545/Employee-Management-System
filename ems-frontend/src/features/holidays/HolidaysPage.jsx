import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import axiosInstance from '../../api/axiosInstance';

const schema = yup.object({
  name: yup.string().required('Holiday name is required').max(100),
  holidayDate: yup.string().required('Date is required'),
  description: yup.string().max(255).nullable(),
});

export default function HolidaysPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const triggerRefresh = () => setRefresh((n) => n + 1);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', holidayDate: '', description: '' },
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get('/holidays');
        if (!cancelled) setHolidays(data.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refresh]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', holidayDate: '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (holiday) => {
    setEditing(holiday);
    reset({ name: holiday.name, holidayDate: holiday.holidayDate, description: holiday.description || '' });
    setDialogOpen(true);
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editing) {
        await axiosInstance.put(`/holidays/${editing.id}`, values);
        enqueueSnackbar('Holiday updated', { variant: 'success' });
      } else {
        await axiosInstance.post('/holidays', values);
        enqueueSnackbar('Holiday created', { variant: 'success' });
      }
      setDialogOpen(false);
      triggerRefresh();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to save holiday', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/holidays/${deleteTarget.id}`);
      enqueueSnackbar('Holiday deleted', { variant: 'success' });
      setDeleteTarget(null);
      triggerRefresh();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to delete holiday', { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Holiday', render: (r) => <Typography fontWeight={600}>{r.name}</Typography> },
    { key: 'holidayDate', label: 'Date' },
    { key: 'description', label: 'Description', render: (r) => r.description || '—' },
    {
      key: 'actions', label: '', align: 'right',
      render: (r) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Button size="small" startIcon={<FiEdit2 size={13} />} onClick={() => openEdit(r)}>Edit</Button>
          <Button size="small" color="error" startIcon={<FiTrash2 size={13} />} onClick={() => setDeleteTarget(r)}>Delete</Button>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Stack spacing={0.25}>
          <Typography variant="h5" fontWeight={700}>Holidays</Typography>
          <Typography variant="body2" color="text.secondary">Manage company holiday calendar</Typography>
        </Stack>
        <Button variant="contained" startIcon={<FiPlus size={16} />} onClick={openCreate}>Add Holiday</Button>
      </Stack>

      <DataTable columns={columns} rows={holidays} loading={loading} emptyMessage="No holidays configured" />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField label="Holiday Name" fullWidth autoFocus {...register('name')} error={Boolean(errors.name)} helperText={errors.name?.message} />
              <TextField label="Date" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} {...register('holidayDate')} error={Boolean(errors.holidayDate)} helperText={errors.holidayDate?.message} />
              <TextField label="Description (optional)" fullWidth multiline rows={2} {...register('description')} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Add Holiday'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this holiday?"
        description={`"${deleteTarget?.name}" will be removed from the calendar.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Stack>
  );
}
