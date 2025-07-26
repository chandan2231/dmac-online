import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import {
  darkTheme,
  greenTheme,
  lightTheme,
  blueTheme,
  yellowTheme,
  violetTheme,
  redTheme,
} from './theme';
import { useCookies } from 'react-cookie';

export type ThemeName =
  | 'light'
  | 'dark'
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'violet';

const themeMap = {
  light: lightTheme,
  dark: darkTheme,
  green: greenTheme,
  red: redTheme,
  blue: blueTheme,
  yellow: yellowTheme,
  violet: violetTheme,
};

interface ThemeContextProps {
  themeName: ThemeName;
  isThemeModalOpen: boolean;
  setThemeName: (name: ThemeName) => void;
  setIsThemeModalOpen: (isOpen: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error('useThemeContext must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [cookies, setCookie] = useCookies(['theme']);
  const [themeName, setThemeNameState] = useState<ThemeName>(
    cookies.theme || 'light'
  );
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name);
    setCookie('theme', name, { path: '/', maxAge: 60 * 60 * 24 * 365 }); // 1 year
  };

  useEffect(() => {
    // Sync state with cookie if it changes externally
    if (cookies.theme && cookies.theme !== themeName) {
      setThemeNameState(cookies.theme);
    }
  }, [cookies.theme]);

  return (
    <ThemeContext.Provider
      value={{ themeName, isThemeModalOpen, setIsThemeModalOpen, setThemeName }}
    >
      <MUIThemeProvider theme={themeMap[themeName]}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
