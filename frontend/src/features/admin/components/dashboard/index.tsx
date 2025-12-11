import { Box, Typography } from '@mui/material';
import { TabHeaderLayout } from '../../../../components/tab-header';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';

const getTextByRole = (role: string | undefined) => {
  switch (role) {
    case 'ADMIN':
      return 'Admin';
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'COUNTRY_ADMIN':
      return 'Country Admin';
    case 'THERAPIST':
      return 'Therapist';
    case 'EXPERT':
      return 'Expert';
    case 'USER':
      return 'User';
    default:
      return '';
  }
};

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <Box
      display="flex"
      sx={{
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: 2,
      }}
      gap={1}
    >
      <TabHeaderLayout
        leftNode={
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              padding: 0,
            }}
          >
            Welcome to {getTextByRole(user?.role)} Dashboard
          </Typography>
        }
      />
    </Box>
  );
};

export default Dashboard;
