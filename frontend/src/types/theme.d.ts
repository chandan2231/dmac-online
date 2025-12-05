// theme.d.ts or at the top of your theme file

import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    customBackgrounds: {
      authLayout: string;
    };
    morenButton: {
      height: string;
      borderRadius: string;
    };
    colors: {
      inputBorder: string;
      focusBorder: string;
      loader: string;
      errorBg: string;
      errorText: string;
    };
    landingPage: {
      primary: string;
      secondary: string;
      tertiary: string;
      background: string;
      border: string;
      darkBg: string;
    };
  }

  interface ThemeOptions {
    customBackgrounds: {
      authLayout: string;
    };
    morenButton: {
      height: string;
      borderRadius: string;
    };
    colors: {
      inputBorder: string;
      focusBorder: string;
      loader: string;
      errorBg: string;
      errorText: string;
    };
    landingPage: {
      primary: string;
      secondary: string;
      tertiary: string;
      background: string;
      border: string;
      darkBg: string;
    };
  }
}
