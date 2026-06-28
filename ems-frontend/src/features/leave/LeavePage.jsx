import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { FiCheck, FiX } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import {
  fetchPendingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} from '../../store/slices/leaveSlice';
import leaveApi from '../../api/endpoints/leaveApi';
import { LEAVE_STATUS_COLORS } from '../../utils/constants';

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

export default function LeavePage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { pending, status, pagination } = useSelector((state) => state.leave);

  const [tab, setTab] = useState(0); // 0 = pending queue, 1 = all requests
  const [allRequests, setAllRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (tab === 0) {
      dispatch(fetchPendingLeaveRequests({ page, size: pageSize }));
    }
  }, [dispatch, tab, page, pageSize]);

  useEffect(() => {
    if (tab !== 1) return;

    let cancelled = false;
    leaveApi
      .search({ status: statusFilter || undefined, page, size: pageSize })
      .then(({ data }) => {
        if (!cancelled) setAllRequests(data.data.content);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [tab, statusFilter, page, pageSize]);

  const handleTabChange = (_, newTab) => {
    setTab(newTab);
    setPage(0);
  };

  const handleApprove = async (row) => {
    setActionLoading(true);
    const result = await dispatch(approveLeaveRequest(row.id));
    setActionLoading(false);
    if (approveLeaveRequest.fulfilled.match(result)) {
      enqueueSnackbar('Leave request approved', { variant: 'success' });
    } else {
      enqueueSnackbar(result.payload || 'Failed to approve request', { variant: 'error' });
    }
  };

  const handleRejectConfirm = async () => {
    setActionLoading(true);
    const result = await dispatch(rejectLeaveRequest({ id: rejectTarget.id, rejectionReason }));
    setActionLoading(false);
    setRejectTarget(null);
    setRejectionReason('');
    if (rejectLeaveRequest.fulfilled.match(result)) {
      enqueueSnackbar('Leave request rejected', { variant: 'success' });
    } else {
      enqueueSnackbar(result.payload || 'Failed to reject request', { variant: 'error' });
    }
  };

  const pendingColumns = [
    { key: 'employeeName', label: 'Employee', render: (row) => <Typography fontWeight={600}>{row.employeeName}</Typography> },
    { key: 'leaveTypeName', label: 'Type' },
    { key: 'startDate', label: 'Start' },
    { key: 'endDate', label: 'End' },
    { key: 'totalDays', label: 'Days' },
    { key: 'reason', label: 'Reason', render: (row) => row.reason || '—' },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Button size="small" color="success" startIcon={<FiCheck size={13} />} onClick={() => handleApprove(row)} disabled={actionLoading}>
            Approve
          </Button>
          <Button size="small" color="error" startIcon={<FiX size={13} />} onClick={() => setRejectTarget(row)} disabled={actionLoading}>
            Reject
          </Button>
        </Stack>
      ),
    },
  ];

  const allColumns = [
    { key: 'employeeName', label: 'Employee', render: (row) => <Typography fontWeight={600}>{row.employeeName}</Typography> },
    { key: 'leaveTypeName', label: 'Type' },
    { key: 'startDate', label: 'Start' },
    { key: 'endDate', label: 'End' },
    { key: 'totalDays', label: 'Days' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Chip label={row.status} size="small" color={LEAVE_STATUS_COLORS[row.status] || 'default'} />,
    },
    { key: 'approvedByName', label: 'Reviewed By', render: (row) => row.approvedByName || '—' },
  ];

  return (
    <Stack spacing={3}>
      <Stack spacing={0.25}>
        <Typography variant="h5" fontWeight={700}>
          Leave Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review pending requests and browse leave history
        </Typography>
      </Stack>

      <Tabs value={tab} onChange={handleTabChange}>
        <Tab label={`Pending (${pagination.totalElements || pending.length})`} />
        <Tab label="All Requests" />
      </Tabs>

      {tab === 0 && (
        <DataTable
          columns={pendingColumns}
          rows={pending}
          loading={status === 'loading'}
          emptyMessage="No pending leave requests"
          page={page}
          pageSize={pageSize}
          totalElements={pagination.totalElements}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          <TextField
            select
            label="Status"
            size="small"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            sx={{ maxWidth: 200 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <DataTable columns={allColumns} rows={allRequests} emptyMessage="No leave requests found" />
        </Stack>
      )}

      <Dialog open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} maxWidth="xs" fullWidth>
        <Box>
          <DialogTitle sx={{ fontWeight: 700 }}>Reject leave request</DialogTitle>
          <DialogContent>
            <TextField
              label="Reason for rejection"
              fullWidth
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              autoFocus
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim() || actionLoading}
            >
              Reject Request
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
}
