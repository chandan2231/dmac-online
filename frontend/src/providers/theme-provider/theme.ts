import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    success: { main: '#4caf50' },
    error: { main: '#d32f2f' },
    warning: { main: '#ed6c02' },
    info: { main: '#0288d1' },
    background: { default: '#1976d2' },
  },
  customBackgrounds: {
    authLayout: 'linear-gradient(to right, #ffffff, #ffffff)', // Light theme auth background
  },
  morenButton: {
    height: '36px',
    borderRadius: '999px',
  },
  colors: {
    inputBorder: '#1976d2',
    focusBorder: '#1976d2',
    loader: '#1976d2',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1976d2' },
    success: { main: '#4caf50' },
    error: { main: '#d32f2f' },
    warning: { main: '#ed6c02' },
    info: { main: '#0288d1' },
    background: { default: '#1976d2' },
  },
  customBackgrounds: {
    authLayout: 'linear-gradient(to right, #ffffff, #ffffff)', // Light theme auth background
  },
  morenButton: {
    height: '36px',
    borderRadius: '999px',
  },
  colors: {
    inputBorder: '#1976d2',
    focusBorder: '#1976d2',
    loader: '#1976d2',
  },
});

export { lightTheme, darkTheme };
