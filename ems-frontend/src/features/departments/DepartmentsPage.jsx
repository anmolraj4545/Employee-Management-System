import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../../store/slices/departmentSlice';
import { fetchEmployeeDropdown } from '../../store/slices/employeeSlice';

const schema = yup.object({
  name: yup.string().required('Department name is required').max(100),
  description: yup.string().max(500).nullable(),
  headEmployeeId: yup.string().nullable(),
});

export default function DepartmentsPage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { items, status } = useSelector((state) => state.departments);
  const { dropdown: employees } = useSelector((state) => state.employees);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', description: '', headEmployeeId: '' },
  });

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchEmployeeDropdown());
  }, [dispatch]);

  const openCreateDialog = () => {
    setEditing(null);
    reset({ name: '', description: '', headEmployeeId: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (dept) => {
    setEditing(dept);
    reset({
      name: dept.name,
      description: dept.description || '',
      headEmployeeId: dept.headEmployeeId ? String(dept.headEmployeeId) : '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    const payload = {
      ...values,
      headEmployeeId: values.headEmployeeId || null,
    };

    const action = editing
      ? updateDepartment({ id: editing.id, payload })
      : createDepartment(payload);

    const result = await dispatch(action);
    setSubmitting(false);

    if (result.meta.requestStatus === 'fulfilled') {
      enqueueSnackbar(editing ? 'Department updated' : 'Department created', { variant: 'success' });
      setDialogOpen(false);
    } else {
      enqueueSnackbar(result.payload || 'Something went wrong', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const result = await dispatch(deleteDepartment(confirmDeleteId));
    setDeleting(false);
    setConfirmDeleteId(null);
    if (deleteDepartment.fulfilled.match(result)) {
      enqueueSnackbar('Department deleted', { variant: 'success' });
    } else {
      enqueueSnackbar(result.payload || 'Failed to delete department', { variant: 'error' });
    }
  };

  const columns = [
    { key: 'name', label: 'Department', render: (row) => <Typography fontWeight={600}>{row.name}</Typography> },
    { key: 'description', label: 'Description', render: (row) => row.description || '—' },
    { key: 'headEmployeeName', label: 'Head', render: (row) => row.headEmployeeName || '—' },
    {
      key: 'employeeCount',
      label: 'Employees',
      render: (row) => (
        <Stack direction="row" spacing={0.75} alignItems="center">
          <FiUsers size={14} />
          <span>{row.employeeCount}</span>
        </Stack>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Button size="small" onClick={() => openEditDialog(row)} startIcon={<FiEdit2 size={13} />}>
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => setConfirmDeleteId(row.id)}
            startIcon={<FiTrash2 size={13} />}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Stack spacing={0.25}>
          <Typography variant="h5" fontWeight={700}>
            Departments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {items.length} departments
          </Typography>
        </Stack>
        <Button variant="contained" startIcon={<FiPlus size={16} />} onClick={openCreateDialog}>
          Add Department
        </Button>
      </Stack>

      <DataTable
        columns={columns}
        rows={items}
        loading={status === 'loading'}
        emptyMessage="No departments yet"
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Department' : 'Add Department'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="Department Name"
                fullWidth
                autoFocus
                {...register('name')}
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                {...register('description')}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
              />
              <TextField select label="Department Head" fullWidth defaultValue="" {...register('headEmployeeId')}>
                <MenuItem value="">None</MenuItem>
                {employees.map((e) => (
                  <MenuItem key={e.id} value={String(e.id)}>
                    {e.fullName}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Department'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete this department?"
        description="Departments with assigned employees cannot be deleted. Reassign employees first if needed."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </Stack>
  );
}
