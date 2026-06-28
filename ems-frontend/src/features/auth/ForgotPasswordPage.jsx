import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { FiArrowLeft } from 'react-icons/fi';
import authApi from '../../api/endpoints/authApi';
import { ROUTES } from '../../routes/routePaths';

const schema = yup.object({
  email: yup.string().email('Enter a valid email address').required('Email is required'),
});

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues: { email: '' } });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Stack spacing={2.5}>
        <Typography variant="h5" fontWeight={700}>
          Check your email
        </Typography>
        <Typography variant="body2" color="text.secondary">
          If an account exists for that email, we've sent a link to reset your password.
        </Typography>
        <Link component={RouterLink} to={ROUTES.LOGIN} variant="body2" underline="hover">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <FiArrowLeft size={14} /> <span>Back to sign in</span>
          </Stack>
        </Link>
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Reset your password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your email and we'll send you a link to reset your password.
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2.5}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          autoFocus
          {...register('email')}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
        />

        <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 1.3 }}>
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>

        <Link component={RouterLink} to={ROUTES.LOGIN} variant="body2" underline="hover" sx={{ textAlign: 'center' }}>
          Back to sign in
        </Link>
      </Stack>
    </Box>
  );
}
