import { Box, Typography } from '@mui/material';

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
      <Typography variant="h6" sx={{ padding: 0 }}>
        Welcome to Admin Dashboard
      </Typography>
    </Box>
  );
};

export default Dashboard;
