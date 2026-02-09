import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Footer from '../components/footer';

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
    </Box>
  );
};

export default AuthLayout;
