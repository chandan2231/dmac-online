import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Footer from '../components/footer';
import FloatingPositionedBox from '../components/box';
import LanguageMode from '../i18n/LanguageMode';
import ColorMode from '../providers/theme-provider/ColorMode';

const styles = {
  container: {
    flex: '1 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
};

const AuthLayout = () => {
  return (
    <Box
      component="main"
      sx={{
        ...styles.main,
        background: theme => theme.customBackgrounds.authLayout,
      }}
    >
      <Box
        sx={{
          ...styles.container,
        }}
      >
        <Outlet />
      </Box>
      <Footer />

      <FloatingPositionedBox position="top-right">
        <Box sx={{ display: 'flex', gap: 1 }}>
          <LanguageMode />
          <ColorMode />
        </Box>
      </FloatingPositionedBox>
    </Box>
  );
};

export default AuthLayout;
