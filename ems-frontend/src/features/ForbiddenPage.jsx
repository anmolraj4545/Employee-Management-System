import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import { ROUTES } from '../routes/routePaths';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Stack spacing={2} alignItems="center" textAlign="center" sx={{ maxWidth: 360 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'error.main',
          }}
        >
          <FiLock size={28} />
        </Box>
        <Typography variant="h6" fontWeight={700}>
          You don't have access to this page
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This area is restricted to certain roles. If you think this is a mistake, contact your
          administrator.
        </Typography>
        <Button variant="contained" onClick={() => navigate(ROUTES.DASHBOARD)}>
          Back to dashboard
        </Button>
      </Stack>
    </Box>
  );
}
