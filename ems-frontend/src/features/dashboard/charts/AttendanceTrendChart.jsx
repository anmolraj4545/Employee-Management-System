import { Paper, Stack, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

export default function AttendanceTrendChart({ data = [] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), 'MMM d'),
  }));

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        backdropFilter: 'blur(20px)',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
      }}
    >
      <Stack spacing={0.25} sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Attendance trend
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last {data.length} days
        </Typography>
      </Stack>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Line type="monotone" dataKey="presentCount" name="Present" stroke="#10B981" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="absentCount" name="Absent" stroke="#EF4444" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="lateCount" name="Late" stroke="#F59E0B" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
