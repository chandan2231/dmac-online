import { Box, Typography } from '@mui/material';
import { TabHeaderLayout } from '../../../../components/tab-header';

const Dashboard = () => {
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
            Welcome to Admin Dashboard
          </Typography>
        }
      />
    </Box>
  );
};

export default Dashboard;
