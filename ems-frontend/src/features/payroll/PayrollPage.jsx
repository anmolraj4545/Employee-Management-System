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
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FiPlay, FiDownload, FiDollarSign, FiUsers } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import {
  fetchMonthlyPayroll,
  fetchMonthlySummary,
  generatePayroll,
} from '../../store/slices/payrollSlice';
import payrollApi from '../../api/endpoints/payrollApi';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PayrollPage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { monthlyPayroll, monthlySummary, status, pagination } = useSelector((s) => s.payroll);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [genMonth, setGenMonth] = useState(String(now.getMonth() + 1));
  const [genYear, setGenYear] = useState(String(now.getFullYear()));
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    dispatch(fetchMonthlyPayroll({ month, year, page, size: pageSize }));
    dispatch(fetchMonthlySummary({ month, year }));
  }, [dispatch, month, year, page, pageSize]);

  const handleGenerate = async () => {
    setGenerating(true);
    const result = await dispatch(generatePayroll({ payMonth: Number(genMonth), payYear: Number(genYear) }));
    setGenerating(false);
    setGenerateOpen(false);
    if (generatePayroll.fulfilled.match(result)) {
      enqueueSnackbar(`Generated ${result.payload.length} payslip(s)`, { variant: 'success' });
      dispatch(fetchMonthlyPayroll({ month, year, page, size: pageSize }));
      dispatch(fetchMonthlySummary({ month, year }));
    } else {
      enqueueSnackbar(result.payload || 'Payroll generation failed', { variant: 'error' });
    }
  };

  const handleDownloadPayslip = async (payslip) => {
    try {
      const { data } = await payrollApi.downloadPayslipPdf(payslip.id);
      downloadBlob(data, `payslip-${payslip.employeeCode}-${payslip.payMonth}-${payslip.payYear}.pdf`);
    } catch {
      enqueueSnackbar('Failed to download payslip', { variant: 'error' });
    }
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const columns = [
    { key: 'employeeName', label: 'Employee', render: (r) => <Typography fontWeight={600}>{r.employeeName}</Typography> },
    { key: 'employeeCode', label: 'Code' },
    { key: 'departmentName', label: 'Department', render: (r) => r.departmentName || '—' },
    { key: 'grossSalary', label: 'Gross', render: (r) => <span className="tabular-nums">{formatCurrency(r.grossSalary)}</span> },
    { key: 'netSalary', label: 'Net', render: (r) => <Typography fontWeight={700} className="tabular-nums">{formatCurrency(r.netSalary)}</Typography> },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <Chip
          label={r.status}
          size="small"
          color={r.status === 'PAID' ? 'success' : r.status === 'GENERATED' ? 'info' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) => (
        <Button size="small" startIcon={<FiDownload size={13} />} onClick={() => handleDownloadPayslip(r)}>
          PDF
        </Button>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Stack spacing={0.25}>
          <Typography variant="h5" fontWeight={700}>Payroll</Typography>
          <Typography variant="body2" color="text.secondary">Generate and manage monthly payroll</Typography>
        </Stack>
        <Button variant="contained" startIcon={<FiPlay size={16} />} onClick={() => setGenerateOpen(true)}>
          Generate Payroll
        </Button>
      </Stack>

      <Stack direction="row" spacing={1.5}>
        <TextField
          select
          label="Month"
          size="small"
          value={month}
          onChange={(e) => { setMonth(Number(e.target.value)); setPage(0); }}
          sx={{ minWidth: 140 }}
        >
          {MONTH_NAMES.map((m, i) => (
            <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Year"
          size="small"
          value={year}
          onChange={(e) => { setYear(Number(e.target.value)); setPage(0); }}
          sx={{ minWidth: 100 }}
        >
          {yearOptions.map((y) => (
            <MenuItem key={y} value={y}>{y}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {monthlySummary && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Payslips Generated" value={monthlySummary.payslipCount} icon={FiUsers} color="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Gross" value={formatCurrency(monthlySummary.totalGross)} icon={FiDollarSign} color="info" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Deductions" value={formatCurrency(monthlySummary.totalDeductions)} icon={FiDollarSign} color="error" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Net Pay" value={formatCurrency(monthlySummary.totalNet)} icon={FiDollarSign} color="success" />
          </Grid>
        </Grid>
      )}

      <DataTable
        columns={columns}
        rows={monthlyPayroll}
        loading={status === 'loading'}
        emptyMessage={`No payroll generated for ${MONTH_NAMES[month - 1]} ${year} yet`}
        page={page}
        pageSize={pageSize}
        totalElements={pagination.totalElements}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <Dialog open={generateOpen} onClose={() => setGenerateOpen(false)} maxWidth="xs" fullWidth>
        <Box>
          <DialogTitle sx={{ fontWeight: 700 }}>Generate Payroll</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                This will generate payslips for all active employees with a configured salary structure for the selected month. Already-generated payslips will be skipped.
              </Typography>
              <TextField
                select
                label="Month"
                value={genMonth}
                onChange={(e) => setGenMonth(e.target.value)}
                fullWidth
              >
                {MONTH_NAMES.map((m, i) => (
                  <MenuItem key={i + 1} value={String(i + 1)}>{m}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Year"
                value={genYear}
                onChange={(e) => setGenYear(e.target.value)}
                fullWidth
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={String(y)}>{y}</MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating…' : 'Generate'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
}
