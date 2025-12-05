import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AppAppBar from '../features/landing-page/components/AppBar';
import AppFooter from '../features/landing-page/components/AppFooter';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Prevents any overflow
    width: '100%',
    maxWidth: '100vw',
  },
};

const PatientLayout = () => {
  return (
    <Box
      component="main"
      sx={{
        ...styles.container,
        backgroundColor: theme => theme.palette.background.paper,
      }}
    >
      <AppAppBar />
      <Outlet />
      <AppFooter />
    </Box>
  );
};

export default PatientLayout;
