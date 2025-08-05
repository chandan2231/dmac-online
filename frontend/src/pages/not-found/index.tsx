import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../features/auth/auth.interface';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import PageNotFoundImage from '../../assets/404/404.jpg';

const PageNotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
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
        loading="lazy"
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
  );
};

export default PageNotFound;
