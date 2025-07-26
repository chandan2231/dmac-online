import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    background: { default: '#f5f5f5' },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    background: { default: '#121212' },
  },
});

const greenTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2e7d32' },
    background: { default: '#e8f5e9' },
  },
});

const redTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#d32f2f' },
    background: { default: '#ffebee' },
  },
});

const blueTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    background: { default: '#e3f2fd' },
  },
});

const yellowTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#fbc02d' },
    background: { default: '#fffde7' },
  },
});

const violetTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#8e24aa' },
    background: { default: '#f3e5f5' },
  },
});

export {
  lightTheme,
  darkTheme,
  greenTheme,
  redTheme,
  blueTheme,
  yellowTheme,
  violetTheme,
};
