import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    background: { default: '#1976d2' },
  },
  customBackgrounds: {
    authLayout: 'linear-gradient(to right, #004754, #bebd00)', // Light theme auth background
  },
  morenButton: {
    height: '36px',
    borderRadius: '999px',
  },
  colors: {
    inputBorder: '#ccc',
    focusBorder: '#0072F5',
    loader: '#ffffff',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1976d2' },
    background: { default: '#1976d2' },
  },
  customBackgrounds: {
    authLayout: 'linear-gradient(to right, #004754, #bebd00)', // Light theme auth background
  },
  morenButton: {
    height: '36px',
    borderRadius: '999px',
  },
  colors: {
    inputBorder: '#ccc',
    focusBorder: '#0072F5',
    loader: '#ffffff',
  },
});

export { lightTheme, darkTheme };
