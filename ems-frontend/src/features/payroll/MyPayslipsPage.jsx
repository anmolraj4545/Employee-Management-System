import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Button, Chip, Stack, Typography } from '@mui/material';
import { FiDownload } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import { fetchMyPayslips } from '../../store/slices/payrollSlice';
import payrollApi from '../../api/endpoints/payrollApi';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MyPayslipsPage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { myPayslips, status } = useSelector((state) => state.payroll);

  useEffect(() => {
    dispatch(fetchMyPayslips());
  }, [dispatch]);

  const handleDownload = async (payslip) => {
    try {
      const { data } = await payrollApi.downloadPayslipPdf(payslip.id);
      downloadBlob(data, `payslip-${payslip.employeeCode}-${payslip.payMonth}-${payslip.payYear}.pdf`);
    } catch {
      enqueueSnackbar('Failed to download payslip', { variant: 'error' });
    }
  };

  const columns = [
    {
      key: 'period',
      label: 'Pay Period',
      render: (row) => (
        <Typography fontWeight={600}>
          {MONTH_NAMES[row.payMonth - 1]} {row.payYear}
        </Typography>
      ),
    },
    {
      key: 'grossSalary',
      label: 'Gross Salary',
      render: (row) => formatCurrency(row.grossSalary),
    },
    {
      key: 'deductions',
      label: 'Deductions',
      render: (row) => formatCurrency((row.pfDeduction ?? 0) + (row.taxDeduction ?? 0) + (row.otherDeductions ?? 0)),
    },
    {
      key: 'netSalary',
      label: 'Net Salary',
      render: (row) => <Typography fontWeight={700} color="success.main" className="tabular-nums">{formatCurrency(row.netSalary)}</Typography>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Chip
          label={row.status}
          size="small"
          color={row.status === 'PAID' ? 'success' : row.status === 'GENERATED' ? 'info' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Button size="small" startIcon={<FiDownload size={13} />} onClick={() => handleDownload(row)}>
          PDF
        </Button>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <Stack spacing={0.25}>
        <Typography variant="h5" fontWeight={700}>My Payslips</Typography>
        <Typography variant="body2" color="text.secondary">View and download your monthly payslips</Typography>
      </Stack>

      <DataTable
        columns={columns}
        rows={myPayslips}
        loading={status === 'loading'}
        emptyMessage="No payslips generated yet"
      />
    </Stack>
  );
}

function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}
