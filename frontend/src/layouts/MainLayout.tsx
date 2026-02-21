import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { SidebarProvider } from '../components/sidebar/provider';
import SidebarWithAuth from '../components/sidebar';
import HeaderWithAuth from '../components/header';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    height: { xs: 'auto', sm: '100dvh' },
    minHeight: { xs: '100dvh', sm: 'auto' },
    maxHeight: '100dvh',
    overflowY: 'auto',
    overflowX: 'hidden',
    width: '100%',
    maxWidth: '100vw',
    flex: { xs: 'none', sm: 1 }, // Ensure layout itself doesn't wrap oddly in some contexts
  },
};

const MainLayout = () => {
  return (
    <SidebarProvider>
      <Box sx={{ display: 'flex' }}>
        <HeaderWithAuth />
        <SidebarWithAuth />
        <Box
          component="main"
          sx={{
            ...styles.container,
            backgroundColor: theme => theme.palette.background.paper,
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </SidebarProvider>
  );
};

export default MainLayout;
