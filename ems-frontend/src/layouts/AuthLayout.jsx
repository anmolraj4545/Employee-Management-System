import { Box, Paper, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';
import HiveIcon from '@mui/icons-material/Hive';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 20% 20%, #1E1B4B 0%, #0F172A 60%)'
            : 'radial-gradient(circle at 20% 20%, #EEF2FF 0%, #F8FAFC 60%)',
        px: 2,
      }}
    >
      <Stack spacing={3} alignItems="center" sx={{ width: '100%', maxWidth: 420 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
            }}
          >
            <HiveIcon sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Typography variant="h5" fontWeight={700}>
            EMS
          </Typography>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            width: '100%',
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            backdropFilter: 'blur(20px)',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
          }}
        >
          <Outlet />
        </Paper>
      </Stack>
    </Box>
  );
}
