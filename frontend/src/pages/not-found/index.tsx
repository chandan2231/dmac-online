import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import PageNotFoundImage from '../../assets/404/404.jpg';
import useTimer from '../../hooks/useTimer';
import { ROUTES } from '../../router/router';

const PageNotFound = () => {
  const navigate = useNavigate();
  const isReady = useTimer(200); // 200ms delay
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div
      style={{
        display: !isReady ? 'none' : 'flex',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 2,
        }}
      >
        {/* SVG Illustration */}
        <Box
          component="img"
          src={PageNotFoundImage}
          alt="404 Not Found"
          sx={{
            maxWidth: 400,
            width: '100%',
            mb: 4,
            backgroundColor: 'transparent',
          }}
        />

        {/* Message */}
        <Typography variant="h6" color="text.secondary">
          Page Not Found
        </Typography>

        {/* Button to go back */}
        <Button
          variant="contained"
          sx={{ mt: 4 }}
          onClick={() => navigate(isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN)}
        >
          {isAuthenticated ? 'Go to Home' : 'Go to Login'}
        </Button>
      </Box>
    </div>
  );
};

export default PageNotFound;
