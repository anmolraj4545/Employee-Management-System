import { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FiDownload } from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ReportSection({ title, description, children }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
      <Stack spacing={2}>
        <Stack spacing={0.25}>
          <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

export default function ReportsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const now = new Date();
  const [reportMonth, setReportMonth] = useState(now.getMonth() + 1);
  const [reportYear, setReportYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState({});

  const setLoadingKey = (key, val) => setLoading((prev) => ({ ...prev, [key]: val }));

  const download = async (url, filename, key, params = {}) => {
    setLoadingKey(key, true);
    try {
      const { data } = await axiosInstance.get(url, { params, responseType: 'blob' });
      downloadBlob(data, filename);
    } catch {
      enqueueSnackbar('Failed to generate report', { variant: 'error' });
    } finally {
      setLoadingKey(key, false);
    }
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.25}>
        <Typography variant="h5" fontWeight={700}>Reports</Typography>
        <Typography variant="body2" color="text.secondary">Export data as Excel or PDF</Typography>
      </Stack>

      <ReportSection title="Employee Report" description="Full list of all employees with their details.">
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<FiDownload size={15} />}
            disabled={loading['emp-excel']}
            onClick={() => download('/reports/employees', 'employee-report.xlsx', 'emp-excel', { format: 'excel' })}
          >
            {loading['emp-excel'] ? 'Generating…' : 'Download Excel'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<FiDownload size={15} />}
            disabled={loading['emp-pdf']}
            onClick={() => download('/reports/employees', 'employee-report.pdf', 'emp-pdf', { format: 'pdf' })}
          >
            {loading['emp-pdf'] ? 'Generating…' : 'Download PDF'}
          </Button>
        </Stack>
      </ReportSection>

      <ReportSection title="Payroll Report" description="Monthly payslip summary for all employees.">
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <TextField
            select
            label="Month"
            size="small"
            value={reportMonth}
            onChange={(e) => setReportMonth(Number(e.target.value))}
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
            value={reportYear}
            onChange={(e) => setReportYear(Number(e.target.value))}
            sx={{ minWidth: 100 }}
          >
            {yearOptions.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </TextField>
          <Button
            variant="outlined"
            startIcon={<FiDownload size={15} />}
            disabled={loading['payroll-excel']}
            onClick={() => download('/reports/payroll', `payroll-${reportMonth}-${reportYear}.xlsx`, 'payroll-excel', { month: reportMonth, year: reportYear })}
          >
            {loading['payroll-excel'] ? 'Generating…' : 'Download Excel'}
          </Button>
        </Stack>
      </ReportSection>

      <ReportSection title="Attendance Report" description="Full attendance history across all employees.">
        <Button
          variant="outlined"
          startIcon={<FiDownload size={15} />}
          disabled={loading['att-excel']}
          onClick={() => download('/reports/attendance', 'attendance-report.xlsx', 'att-excel')}
          sx={{ alignSelf: 'flex-start' }}
        >
          {loading['att-excel'] ? 'Generating…' : 'Download Excel'}
        </Button>
      </ReportSection>

      <ReportSection title="Leave Report" description="All leave requests across all employees.">
        <Button
          variant="outlined"
          startIcon={<FiDownload size={15} />}
          disabled={loading['leave-excel']}
          onClick={() => download('/reports/leave', 'leave-report.xlsx', 'leave-excel')}
          sx={{ alignSelf: 'flex-start' }}
        >
          {loading['leave-excel'] ? 'Generating…' : 'Download Excel'}
        </Button>
      </ReportSection>
    </Stack>
  );
}
