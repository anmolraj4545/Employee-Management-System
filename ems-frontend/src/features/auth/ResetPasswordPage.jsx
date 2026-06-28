import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import authApi from '../../api/endpoints/authApi';
import { ROUTES } from '../../routes/routePaths';

const schema = yup.object({
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
});

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async ({ newPassword }) => {
    if (!token) {
      setError('Reset token is missing from the link. Please request a new one.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(token, newPassword);
      navigate(ROUTES.LOGIN, { replace: true, state: { passwordReset: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Set a new password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose a strong password you haven't used before.
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2.5}>
        <TextField
          label="New Password"
          type="password"
          fullWidth
          autoFocus
          {...register('newPassword')}
          error={Boolean(errors.newPassword)}
          helperText={errors.newPassword?.message}
        />
        <TextField
          label="Confirm New Password"
          type="password"
          fullWidth
          {...register('confirmPassword')}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message}
        />

        <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 1.3 }}>
          {loading ? 'Resetting…' : 'Reset password'}
        </Button>

        <Link component={RouterLink} to={ROUTES.LOGIN} variant="body2" underline="hover" sx={{ textAlign: 'center' }}>
          Back to sign in
        </Link>
      </Stack>
    </Box>
  );
}
