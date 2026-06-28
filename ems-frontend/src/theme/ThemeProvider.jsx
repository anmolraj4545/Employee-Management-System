import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import buildTheme from './theme';

export default function ThemeProvider({ children }) {
  const mode = useSelector((state) => state.ui.themeMode);
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
