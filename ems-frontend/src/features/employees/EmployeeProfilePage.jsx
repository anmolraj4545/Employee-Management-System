import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { FiArrowLeft, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { fetchEmployeeById, deleteEmployee, clearCurrentEmployee } from '../../store/slices/employeeSlice';
import employeeApi from '../../api/endpoints/employeeApi';
import PageLoader from '../../components/PageLoader';
import ConfirmDialog from '../../components/ConfirmDialog';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../routes/routePaths';
import { EMPLOYEE_STATUS_COLORS } from '../../utils/constants';

function InfoRow({ label, value }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.03em">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value || '—'}
      </Typography>
    </Stack>
  );
}

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { current, status } = useSelector((state) => state.employees);

  const [tab, setTab] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [ownProfile, setOwnProfile] = useState(null);
  const [loadingOwn, setLoadingOwn] = useState(!id);

  const isViewingOwn = !id;
  const employee = isViewingOwn ? ownProfile : current;

  useEffect(() => {
    if (id) {
      dispatch(fetchEmployeeById(id));
      return () => dispatch(clearCurrentEmployee());
    } else {
      let cancelled = false;
      employeeApi.getOwnProfile().then(({ data }) => {
        if (!cancelled) {
          setOwnProfile(data.data);
          setLoadingOwn(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    setDeleting(true);
    const result = await dispatch(deleteEmployee(id));
    setDeleting(false);
    setConfirmDelete(false);
    if (deleteEmployee.fulfilled.match(result)) {
      navigate(ROUTES.EMPLOYEES);
    }
  };

  if ((id && status === 'loading') || loadingOwn) {
    return <PageLoader label="Loading profile…" />;
  }

  if (!employee) {
    return <PageLoader label="Employee not found" />;
  }

  const canEdit = isAdmin;

  return (
    <Stack spacing={3}>
      {id && (
        <Button startIcon={<FiArrowLeft size={16} />} onClick={() => navigate(-1)} color="inherit" sx={{ alignSelf: 'flex-start' }}>
          Back to Employees
        </Button>
      )}

      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
          <Avatar src={employee.profilePhotoUrl} sx={{ width: 88, height: 88, fontSize: '1.75rem', bgcolor: 'primary.main' }}>
            {employee.fullName?.slice(0, 2).toUpperCase()}
          </Avatar>

          <Stack spacing={0.75} flex={1}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Typography variant="h5" fontWeight={700}>
                {employee.fullName}
              </Typography>
              <Chip
                label={employee.status?.replace('_', ' ')}
                size="small"
                color={EMPLOYEE_STATUS_COLORS[employee.status] || 'default'}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {employee.designationTitle || 'No designation'} · {employee.departmentName || 'No department'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {employee.employeeCode} · {employee.email}
            </Typography>
          </Stack>

          {canEdit && id && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<FiEdit2 size={15} />}
                onClick={() => navigate(`/employees/${id}/edit`)}
              >
                Edit
              </Button>
              <Button variant="outlined" color="error" startIcon={<FiTrash2 size={15} />} onClick={() => setConfirmDelete(true)}>
                Deactivate
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 4 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Tab label="Overview" />
          <Tab label="Contact & Emergency" />
        </Tabs>

        <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoRow label="Employee Code" value={employee.employeeCode} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoRow label="Gender" value={employee.gender} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoRow label="Date of Birth" value={employee.dateOfBirth} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoRow label="Joining Date" value={employee.joiningDate} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoRow label="Department" value={employee.departmentName} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoRow label="Designation" value={employee.designationTitle} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoRow label="Manager" value={employee.managerName} />
              </Grid>
              {isAdmin && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoRow
                    label="Salary"
                    value={
                      employee.salary != null
                        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(employee.salary)
                        : null
                    }
                  />
                </Grid>
              )}
            </Grid>
          )}

          {tab === 1 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow label="Email" value={employee.email} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow label="Phone" value={employee.phoneNumber} />
              </Grid>
              <Grid size={12}>
                <InfoRow label="Address" value={[employee.address, employee.city, employee.state, employee.country].filter(Boolean).join(', ')} />
              </Grid>
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow label="Emergency Contact Name" value={employee.emergencyContactName} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow label="Emergency Contact Phone" value={employee.emergencyContactPhone} />
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>

      <ConfirmDialog
        open={confirmDelete}
        title="Deactivate this employee?"
        description="This will mark the employee as terminated and disable their login. This action can be reversed by an administrator later."
        confirmLabel="Deactivate"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </Stack>
  );
}
