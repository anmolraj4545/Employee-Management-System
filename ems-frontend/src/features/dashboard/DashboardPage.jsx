import { useEffect, useState } from 'react';
import { Grid, Stack, Typography } from '@mui/material';
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiCalendar,
  FiDollarSign,
} from 'react-icons/fi';
import StatCard from '../../components/StatCard';
import PageLoader from '../../components/PageLoader';
import AttendanceTrendChart from './charts/AttendanceTrendChart';
import DepartmentDistributionChart from './charts/DepartmentDistributionChart';
import dashboardApi from '../../api/endpoints/dashboardApi';
import useAuth from '../../hooks/useAuth';

function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export default function DashboardPage() {
  const { isAdmin, user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(isAdmin);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    let cancelled = false;
    async function loadDashboard() {
      try {
        const [summaryRes, trendRes, distributionRes] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getAttendanceTrend(7),
          dashboardApi.getDepartmentDistribution(),
        ]);
        if (cancelled) return;
        setSummary(summaryRes.data.data);
        setTrend(trendRes.data.data);
        setDistribution(distributionRes.data.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Stack spacing={1}>
        <Typography variant="h5" fontWeight={700}>
          Welcome back, {user?.username}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Use the sidebar to check in, apply for leave, or view your payslips.
        </Typography>
      </Stack>
    );
  }

  if (loading) {
    return <PageLoader label="Loading dashboard…" />;
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.25}>
        <Typography variant="h5" fontWeight={700}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of your organization today
        </Typography>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Employees" value={summary?.totalEmployees ?? 0} icon={FiUsers} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Present Today" value={summary?.presentToday ?? 0} icon={FiUserCheck} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Absent Today" value={summary?.absentToday ?? 0} icon={FiUserX} color="error" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Late Today" value={summary?.lateToday ?? 0} icon={FiClock} color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Pending Leave Requests"
            value={summary?.pendingLeaveRequests ?? 0}
            icon={FiCalendar}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Departments" value={summary?.totalDepartments ?? 0} icon={FiUsers} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, lg: 6 }}>
          <StatCard
            label="This Month's Payroll"
            value={formatCurrency(summary?.currentMonthPayroll)}
            icon={FiDollarSign}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <AttendanceTrendChart data={trend} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <DepartmentDistributionChart data={distribution} />
        </Grid>
      </Grid>
    </Stack>
  );
}
