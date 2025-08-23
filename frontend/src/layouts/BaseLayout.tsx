import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

const BaseLayout = () => {
  return (
    <Box component="main">
      <Outlet />
    </Box>
  );
};

export default BaseLayout;
