import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ConfirmDialog from '../../components/ConfirmDialog';
import useAuth from '../../hooks/useAuth';
import axiosInstance from '../../api/axiosInstance';

const schema = yup.object({
  title: yup.string().required('Title is required').max(200),
  content: yup.string().required('Content is required'),
});

function NoticeCard({ notice, isAdmin, onEdit, onDelete }) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack spacing={0.25}>
            <Typography variant="subtitle1" fontWeight={700}>{notice.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              Posted by {notice.publishedByName} · {notice.createdAt ? format(parseISO(notice.createdAt), 'MMM d, yyyy') : ''}
            </Typography>
          </Stack>
          {isAdmin && (
            <Stack direction="row" spacing={0.5}>
              <Button size="small" startIcon={<FiEdit2 size={13} />} onClick={() => onEdit(notice)}>Edit</Button>
              <Button size="small" color="error" startIcon={<FiTrash2 size={13} />} onClick={() => onDelete(notice)}>Delete</Button>
            </Stack>
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
          {notice.content}
        </Typography>
      </Stack>
    </Paper>
  );
}

export default function NoticesPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { isAdmin } = useAuth();
  const [notices, setNotices] = useState([]);
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
    defaultValues: { title: '', content: '' },
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get('/notices');
        if (!cancelled) setNotices(data.data.content || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refresh]);

  const openCreate = () => {
    setEditing(null);
    reset({ title: '', content: '' });
    setDialogOpen(true);
  };

  const openEdit = (notice) => {
    setEditing(notice);
    reset({ title: notice.title, content: notice.content });
    setDialogOpen(true);
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editing) {
        await axiosInstance.put(`/notices/${editing.id}`, values);
        enqueueSnackbar('Notice updated', { variant: 'success' });
      } else {
        await axiosInstance.post('/notices', values);
        enqueueSnackbar('Notice published', { variant: 'success' });
      }
      setDialogOpen(false);
      triggerRefresh();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to save notice', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/notices/${deleteTarget.id}`);
      enqueueSnackbar('Notice removed', { variant: 'success' });
      setDeleteTarget(null);
      triggerRefresh();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to delete notice', { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Stack spacing={0.25}>
          <Typography variant="h5" fontWeight={700}>Notice Board</Typography>
          <Typography variant="body2" color="text.secondary">Company announcements and notices</Typography>
        </Stack>
        {isAdmin && (
          <Button variant="contained" startIcon={<FiPlus size={16} />} onClick={openCreate}>Publish Notice</Button>
        )}
      </Stack>

      {loading && <Typography color="text.secondary">Loading notices…</Typography>}

      {!loading && notices.length === 0 && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">No notices have been published yet.</Typography>
        </Paper>
      )}

      {notices.map((notice) => (
        <NoticeCard
          key={notice.id}
          notice={notice}
          isAdmin={isAdmin}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      ))}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Notice' : 'Publish Notice'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField label="Title" fullWidth autoFocus {...register('title')} error={Boolean(errors.title)} helperText={errors.title?.message} />
              <TextField label="Content" fullWidth multiline rows={6} {...register('content')} error={Boolean(errors.content)} helperText={errors.content?.message} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Publish'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove this notice?"
        description="The notice will be hidden from all employees."
        confirmLabel="Remove"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Stack>
  );
}
