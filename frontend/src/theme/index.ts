import { createTheme } from '@mui/material';

// Export colors for use outside the theme
export const FRIS_COLORS = {
  // Primary colors
  deepBlue: '#263c5a',
  skyBlue: '#60bbc1',
  white: '#ffffff',
  
  // Additional colors in the blue palette
  lightBlue: '#a8d5e2',
  paleBlue: '#e0f4f5',
  darkBlue: '#1a2a40',
  navyBlue: '#0f1c2d',
  
  // Neutral colors
  gray: '#6c757d',
  lightGray: '#f5f5f5',
  mediumGray: '#adb5bd',
  darkGray: '#343a40',
  
  // Functional colors
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  
  // FRIS branding colors
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

// Breakpoints for responsive design
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};

// Typography scale
const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 600, fontSize: '2.5rem' },
  h2: { fontWeight: 600, fontSize: '2rem' },
  h3: { fontWeight: 600, fontSize: '1.75rem' },
  h4: { fontWeight: 600, fontSize: '1.5rem' },
  h5: { fontWeight: 600, fontSize: '1.25rem' },
  h6: { fontWeight: 600, fontSize: '1rem' },
  subtitle1: { fontSize: '1rem', fontWeight: 500 },
  subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
  body1: { fontSize: '1rem' },
  body2: { fontSize: '0.875rem' },
  button: { fontWeight: 500 },
};

// Create and export the theme
const theme = createTheme({
  palette: {
    primary: { 
      main: FRIS_COLORS.deepBlue,
      light: FRIS_COLORS.lightBlue,
      dark: FRIS_COLORS.darkBlue,
      contrastText: FRIS_COLORS.white,
    },
    secondary: { 
      main: FRIS_COLORS.skyBlue,
      light: FRIS_COLORS.paleBlue,
      dark: FRIS_COLORS.darkBlue,
      contrastText: FRIS_COLORS.white,
    },
    error: { main: FRIS_COLORS.error },
    warning: { main: FRIS_COLORS.warning },
    info: { main: FRIS_COLORS.info },
    success: { main: FRIS_COLORS.success },
    background: { 
      default: FRIS_COLORS.lightGray,
      paper: FRIS_COLORS.white,
    },
    text: {
      primary: FRIS_COLORS.darkGray,
      secondary: FRIS_COLORS.gray,
    },
  },
  typography,
  breakpoints,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          textTransform: 'none',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: FRIS_COLORS.white,
          borderRight: `1px solid ${FRIS_COLORS.lightGray}`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme;
