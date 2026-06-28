import { createTheme } from '@mui/material/styles';

// Design tokens — see design plan: indigo primary (not generic violet), slate neutrals,
// Inter for UI legibility across dense data tables, tabular nums for financial figures.
const tokens = {
  primary: {
    main: '#4F46E5', // indigo-600
    light: '#818CF8',
    dark: '#3730A3',
  },
  secondary: {
    main: '#0EA5E9', // sky-500, used sparingly for secondary actions/links
  },
  success: { main: '#10B981' },
  warning: { main: '#F59E0B' },
  error: { main: '#EF4444' },
  info: { main: '#0EA5E9' },
};

function buildTheme(mode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: tokens.primary,
      secondary: tokens.secondary,
      success: tokens.success,
      warning: tokens.warning,
      error: tokens.error,
      info: tokens.info,
      background: {
        default: isDark ? '#0F172A' : '#F8FAFC', // slate-900 / slate-50
        paper: isDark ? '#1E293B' : '#FFFFFF', // slate-800 / white
      },
      text: {
        primary: isDark ? '#F1F5F9' : '#0F172A',
        secondary: isDark ? '#94A3B8' : '#64748B',
      },
      divider: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(15, 23, 42, 0.08)',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontWeight: 600, letterSpacing: '-0.01em' },
      h4: { fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
      body1: { fontSize: '0.9375rem' },
      body2: { fontSize: '0.8125rem' },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // Tabular figures for any element flagged as numeric data (payroll, attendance hours)
          '.tabular-nums': {
            fontVariantNumeric: 'tabular-nums',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(15, 23, 42, 0.06)'}`,
            boxShadow: isDark
              ? '0 1px 2px rgba(0,0,0,0.4)'
              : '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 1px rgba(15, 23, 42, 0.02)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            boxShadow: 'none',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, fontSize: '0.75rem' },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            color: isDark ? '#94A3B8' : '#64748B',
          },
        },
      },
    },
  });
}

export default buildTheme;
