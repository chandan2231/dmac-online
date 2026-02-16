import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AppAppBar from '../features/landing-page/components/AppBar';
import AppFooter from '../features/landing-page/components/AppFooter';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflowX: 'hidden',
    overflowY: 'auto',
    width: '100%',
    maxWidth: '100vw',
    minHeight: '100dvh',
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
      <Box sx={{ width: '100%', flex: 1, display: 'flex', justifyContent: 'center' }}>
        <Outlet />
      </Box>
      <AppFooter />
    </Box>
  );
};

export default PatientLayout;
