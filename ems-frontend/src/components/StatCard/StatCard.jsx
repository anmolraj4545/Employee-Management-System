import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';

const COLOR_MAP = {
  primary: { bg: 'rgba(79, 70, 229, 0.12)', fg: '#4F46E5' },
  success: { bg: 'rgba(16, 185, 129, 0.12)', fg: '#10B981' },
  warning: { bg: 'rgba(245, 158, 11, 0.12)', fg: '#F59E0B' },
  error: { bg: 'rgba(239, 68, 68, 0.12)', fg: '#EF4444' },
  info: { bg: 'rgba(14, 165, 233, 0.12)', fg: '#0EA5E9' },
};

export default function StatCard({ label, value, icon: Icon, color = 'primary', loading = false, suffix }) {
  const palette = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        backdropFilter: 'blur(20px)',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={64} height={36} />
          ) : (
            <Typography variant="h4" fontWeight={700} className="tabular-nums">
              {value}
              {suffix && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                  {suffix}
                </Typography>
              )}
            </Typography>
          )}
        </Stack>
        {Icon && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: palette.bg,
              color: palette.fg,
              flexShrink: 0,
            }}
          >
            <Icon size={20} />
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
