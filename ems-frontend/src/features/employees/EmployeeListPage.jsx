import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FiPlus, FiSearch } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import { fetchEmployees } from '../../store/slices/employeeSlice';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import useDebounce from '../../hooks/useDebounce';
import { employeeDetailPath, ROUTES } from '../../routes/routePaths';
import { EMPLOYEE_STATUS_COLORS } from '../../utils/constants';

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'];

export default function EmployeeListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status, pagination } = useSelector((state) => state.employees);
  const { items: departments } = useSelector((state) => state.departments);

  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [employeeStatus, setEmployeeStatus] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchEmployees({
        search: debouncedSearch || undefined,
        departmentId: departmentId || undefined,
        status: employeeStatus || undefined,
        page,
        size: pageSize,
      })
    );
  }, [dispatch, debouncedSearch, departmentId, employeeStatus, page, pageSize]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleDepartmentChange = (e) => {
    setDepartmentId(e.target.value);
    setPage(0);
  };

  const handleStatusChange = (e) => {
    setEmployeeStatus(e.target.value);
    setPage(0);
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Employee',
        render: (row) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar src={row.profilePhotoUrl} sx={{ width: 36, height: 36, fontSize: '0.8rem' }}>
              {row.fullName?.slice(0, 2).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {row.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.employeeCode}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      { key: 'email', label: 'Email' },
      { key: 'departmentName', label: 'Department', render: (row) => row.departmentName || '—' },
      { key: 'designationTitle', label: 'Designation', render: (row) => row.designationTitle || '—' },
      {
        key: 'status',
        label: 'Status',
        render: (row) => (
          <Chip
            label={row.status?.replace('_', ' ')}
            size="small"
            color={EMPLOYEE_STATUS_COLORS[row.status] || 'default'}
            variant="outlined"
          />
        ),
      },
    ],
    []
  );

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Stack spacing={0.25}>
          <Typography variant="h5" fontWeight={700}>
            Employees
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pagination.totalElements} total employees
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<FiPlus size={16} />}
          onClick={() => navigate(ROUTES.EMPLOYEE_NEW)}
        >
          Add Employee
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          placeholder="Search by name, email, or code…"
          value={search}
          onChange={handleSearchChange}
          size="small"
          sx={{ flex: 1, minWidth: 220 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <FiSearch size={16} />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          label="Department"
          value={departmentId}
          onChange={handleDepartmentChange}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All departments</MenuItem>
          {departments.map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Status"
          value={employeeStatus}
          onChange={handleStatusChange}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {s.replace('_', ' ')}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <DataTable
        columns={columns}
        rows={items}
        loading={status === 'loading'}
        emptyMessage="No employees match your filters"
        page={page}
        pageSize={pageSize}
        totalElements={pagination.totalElements}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={(row) => navigate(employeeDetailPath(row.id))}
      />
    </Stack>
  );
}
