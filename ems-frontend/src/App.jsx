import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import AppRoutes from './routes/AppRoutes';
import { refreshSession } from './store/slices/authSlice';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Attempt a silent refresh on app load — if the user has a valid refresh-token cookie
    // from a previous session, this restores them without requiring a fresh login.
    dispatch(refreshSession());
  }, [dispatch]);

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      autoHideDuration={4000}
    >
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SnackbarProvider>
  );
}
