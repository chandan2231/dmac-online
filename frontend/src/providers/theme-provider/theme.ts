import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
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
    background: { default: '#1976d2' },
  },
  customBackgrounds: {
    authLayout: 'linear-gradient(to right, #000000, #000000)', // Light theme auth background
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
