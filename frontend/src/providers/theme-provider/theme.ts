import { createTheme } from '@mui/material/styles';
import { tokens } from './tokens';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.primary.main },
    success: { main: tokens.success.main },
    error: { main: tokens.error.main },
    warning: { main: tokens.warning.main },
    info: { main: tokens.info.main },
    background: { default: tokens.common.white },
  },
  customBackgrounds: {
    authLayout: `linear-gradient(to right, ${tokens.common.white}, ${tokens.common.white})`, // Light theme auth background
  },
  morenButton: {
    height: '36px',
    borderRadius: '999px',
  },
  colors: {
    inputBorder: tokens.primary.main,
    focusBorder: tokens.primary.main,
    loader: tokens.primary.main,
    errorBg: tokens.error.bg,
    errorText: tokens.error.text,
  },
  landingPage: tokens.landingPage,
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: tokens.primary.main },
    success: { main: tokens.success.main },
    error: { main: tokens.error.main },
    warning: { main: tokens.warning.main },
    info: { main: tokens.info.main },
    background: { default: tokens.primary.main },
  },
  customBackgrounds: {
    authLayout: `linear-gradient(to right, ${tokens.common.white}, ${tokens.common.white})`, // Light theme auth background
  },
  morenButton: {
    height: '36px',
    borderRadius: '999px',
  },
  colors: {
    inputBorder: tokens.primary.main,
    focusBorder: tokens.primary.main,
    loader: tokens.primary.main,
    errorBg: tokens.error.bg,
    errorText: tokens.error.text,
  },
  landingPage: tokens.landingPage,
});

export { lightTheme, darkTheme };
