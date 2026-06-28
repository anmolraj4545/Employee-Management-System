import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FiArrowLeft } from 'react-icons/fi';
import { FormSelect } from '../../components/FormFields';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import { fetchEmployeeDropdown, createEmployee, updateEmployee, fetchEmployeeById } from '../../store/slices/employeeSlice';
import designationApi from '../../api/endpoints/designationApi';
import { employeeDetailPath } from '../../routes/routePaths';
import PageLoader from '../../components/PageLoader';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'TERMINATED', label: 'Terminated' },
];

const ROLE_OPTIONS = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'HR_MANAGER', label: 'HR Manager' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
];

const baseSchema = {
  firstName: yup.string().required('First name is required').max(50),
  lastName: yup.string().required('Last name is required').max(50),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phoneNumber: yup.string().nullable(),
  gender: yup.string().nullable(),
  dateOfBirth: yup.string().nullable(),
  address: yup.string().nullable(),
  city: yup.string().nullable(),
  state: yup.string().nullable(),
  country: yup.string().nullable(),
  joiningDate: yup.string().required('Joining date is required'),
  departmentId: yup.string().nullable(),
  designationId: yup.string().nullable(),
  managerId: yup.string().nullable(),
  salary: yup
    .number()
    .typeError('Salary must be a number')
    .min(0, 'Salary cannot be negative')
    .nullable()
    .transform((v, orig) => (orig === '' ? null : v)),
  emergencyContactName: yup.string().nullable(),
  emergencyContactPhone: yup.string().nullable(),
  status: yup.string().nullable(),
};

const createSchema = yup.object({
  ...baseSchema,
  username: yup.string().required('Username is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Initial password is required'),
  role: yup.string().required('Role is required'),
});

const updateSchema = yup.object(baseSchema);

export default function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { items: departments } = useSelector((state) => state.departments);
  const { dropdown: managers, current } = useSelector((state) => state.employees);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(isEdit ? updateSchema : createSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      gender: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      country: '',
      joiningDate: '',
      departmentId: '',
      designationId: '',
      managerId: '',
      salary: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      status: 'ACTIVE',
      username: '',
      password: '',
      role: 'EMPLOYEE',
    },
  });

  const selectedDepartmentId = watch('departmentId');

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchEmployeeDropdown());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchEmployeeById(id)).then(() => setLoading(false));
    }
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && current && current.id === Number(id)) {
      reset({
        firstName: current.firstName || '',
        lastName: current.lastName || '',
        email: current.email || '',
        phoneNumber: current.phoneNumber || '',
        gender: current.gender || '',
        dateOfBirth: current.dateOfBirth || '',
        address: current.address || '',
        city: current.city || '',
        state: current.state || '',
        country: current.country || '',
        joiningDate: current.joiningDate || '',
        departmentId: current.departmentId ? String(current.departmentId) : '',
        designationId: current.designationId ? String(current.designationId) : '',
        managerId: current.managerId ? String(current.managerId) : '',
        salary: current.salary ?? '',
        emergencyContactName: current.emergencyContactName || '',
        emergencyContactPhone: current.emergencyContactPhone || '',
        status: current.status || 'ACTIVE',
      });
    }
  }, [current, id, isEdit, reset]);

  useEffect(() => {
    let cancelled = false;
    async function loadDesignations() {
      const { data } = await designationApi.getAll(selectedDepartmentId || undefined);
      if (!cancelled) setDesignations(data.data);
    }
    loadDesignations();
    return () => {
      cancelled = true;
    };
  }, [selectedDepartmentId]);

  const onSubmit = async (values) => {
    setSubmitError(null);
    setSubmitting(true);

    const payload = {
      ...values,
      departmentId: values.departmentId || null,
      designationId: values.designationId || null,
      managerId: values.managerId || null,
      salary: values.salary === '' ? null : values.salary,
    };

    try {
      if (isEdit) {
        const result = await dispatch(updateEmployee({ id, payload }));
        if (updateEmployee.fulfilled.match(result)) {
          enqueueSnackbar('Employee updated successfully', { variant: 'success' });
          navigate(employeeDetailPath(id));
        } else {
          setSubmitError(result.payload || 'Failed to update employee');
        }
      } else {
        const result = await dispatch(createEmployee(payload));
        if (createEmployee.fulfilled.match(result)) {
          enqueueSnackbar('Employee created successfully', { variant: 'success' });
          navigate(employeeDetailPath(result.payload.id));
        } else {
          setSubmitError(result.payload || 'Failed to create employee');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader label="Loading employee…" />;

  const departmentOptions = [{ value: '', label: 'None' }, ...departments.map((d) => ({ value: String(d.id), label: d.name }))];
  const designationOptions = [{ value: '', label: 'None' }, ...designations.map((d) => ({ value: String(d.id), label: d.title }))];
  const managerOptions = [
    { value: '', label: 'None' },
    ...managers.filter((m) => String(m.id) !== id).map((m) => ({ value: String(m.id), label: m.fullName })),
  ];

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Button startIcon={<FiArrowLeft size={16} />} onClick={() => navigate(-1)} color="inherit">
          Back
        </Button>
      </Stack>

      <Typography variant="h5" fontWeight={700}>
        {isEdit ? 'Edit Employee' : 'Add Employee'}
      </Typography>

      {submitError && <Alert severity="error">{submitError}</Alert>}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4 }}>
          <Stack spacing={3}>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={700}>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="First Name" fullWidth {...register('firstName')} error={Boolean(errors.firstName)} helperText={errors.firstName?.message} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Last Name" fullWidth {...register('lastName')} error={Boolean(errors.lastName)} helperText={errors.lastName?.message} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Email" type="email" fullWidth {...register('email')} error={Boolean(errors.email)} helperText={errors.email?.message} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Phone Number" fullWidth {...register('phoneNumber')} error={Boolean(errors.phoneNumber)} helperText={errors.phoneNumber?.message} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormSelect control={control} name="gender" label="Gender" errors={errors} options={[{ value: '', label: 'Not specified' }, ...GENDER_OPTIONS]} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Date of Birth"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register('dateOfBirth')}
                    error={Boolean(errors.dateOfBirth)}
                    helperText={errors.dateOfBirth?.message}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField label="Address" fullWidth {...register('address')} error={Boolean(errors.address)} helperText={errors.address?.message} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField label="City" fullWidth {...register('city')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField label="State" fullWidth {...register('state')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField label="Country" fullWidth {...register('country')} />
                </Grid>
              </Grid>
            </Stack>

            <Divider />

            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={700}>
                Employment Details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Joining Date"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register('joiningDate')}
                    error={Boolean(errors.joiningDate)}
                    helperText={errors.joiningDate?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormSelect control={control} name="status" label="Status" errors={errors} options={STATUS_OPTIONS} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormSelect control={control} name="departmentId" label="Department" errors={errors} options={departmentOptions} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormSelect control={control} name="designationId" label="Designation" errors={errors} options={designationOptions} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormSelect control={control} name="managerId" label="Manager" errors={errors} options={managerOptions} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Salary" type="number" fullWidth {...register('salary')} error={Boolean(errors.salary)} helperText={errors.salary?.message} />
                </Grid>
              </Grid>
            </Stack>

            <Divider />

            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={700}>
                Emergency Contact
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Contact Name" fullWidth {...register('emergencyContactName')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Contact Phone" fullWidth {...register('emergencyContactPhone')} />
                </Grid>
              </Grid>
            </Stack>

            {!isEdit && (
              <>
                <Divider />
                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Login Account
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField label="Username" fullWidth {...register('username')} error={Boolean(errors.username)} helperText={errors.username?.message} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField label="Initial Password" type="password" fullWidth {...register('password')} error={Boolean(errors.password)} helperText={errors.password?.message} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormSelect control={control} name="role" label="Role" errors={errors} options={ROLE_OPTIONS} />
                    </Grid>
                  </Grid>
                </Stack>
              </>
            )}

            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button color="inherit" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Employee'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
}
