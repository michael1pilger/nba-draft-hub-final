// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0053A0', // Mavs blue
    },
    secondary: {
      main: '#B0B7BC', // silver/gray accent
    },
    background: {
      default: '#f4f6f9', // very light gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#1d1d1d',
      secondary: '#5a5a5a',
    },
    error: {
      main: '#d32f2f', // red for "low rank"
    },
    success: {
      main: '#2e7d32', // green for "high rank"
    },
  },
  typography: {
    fontFamily: `'Roboto', 'Helvetica Neue', 'Arial', sans-serif`,
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '0.5px',
      color: '#1d1d1d',
    },
    h5: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
      color: '#444',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.9rem',
      color: '#666',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0053A0',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.8rem',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
