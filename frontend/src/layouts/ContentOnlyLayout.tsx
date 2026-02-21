import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { SidebarProvider } from '../components/sidebar/provider';
import HeaderWithAuth from '../components/header';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: { xs: 'flex-start', sm: 'center' },
    height: { xs: 'auto', sm: '100dvh' },
    minHeight: { xs: '100dvh', sm: 'auto' },
    maxHeight: '100dvh',
    overflowY: { xs: 'auto', sm: 'hidden' },
    overflowX: 'hidden',
    width: '100%',
    maxWidth: '100vw',
    pt: { xs: 4, sm: 0 },
    flex: { xs: 'none', sm: 1 },
  },
};

const ContentOnlyLayout = () => {
  return (
    <SidebarProvider
      showDrawer={false} // Disable the sidebar drawer for this layout
    >
      <Box sx={{ display: 'flex' }}>
        <HeaderWithAuth />
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

export default ContentOnlyLayout;
