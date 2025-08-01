// theme.d.ts or at the top of your theme file

import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    customBackgrounds: {
      authLayout: string;
    };
    morenButton?: {
      height?: string;
      borderRadius?: string;
    };
    colors?: {
      inputBorder?: string;
      focusBorder?: string;
      loader?: string;
    };
  }

  interface ThemeOptions {
    customBackgrounds?: {
      authLayout?: string;
    };
    morenButton?: {
      height?: string;
      borderRadius?: string;
    };
    colors?: {
      inputBorder?: string;
      focusBorder?: string;
      loader?: string;
    };
  }
}
