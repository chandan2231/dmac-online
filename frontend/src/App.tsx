import './i18n/config';
import './App.css';
import AppRouter from './router';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from './features/auth/auth.slice';
import { getRoutesByRole } from './router/router';
import { Box, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      setIsValidating(true);

      // Call backend to validate token and get user details
      axios
        .post(`${import.meta.env.VITE_API_BASE_URL}/auth/validate-token`, {
          token: token,
        })
        .then((response) => {
          if (response.data.isValid && response.data.user) {
            const user = response.data.user;

            // Get allowed routes for user role
            const allowedRoutes = getRoutesByRole(user.role);

            // Set credentials in Redux store with full user data
            dispatch(
              loginSuccess({
                user: user,
                token: token,
                allowedRoutes: allowedRoutes,
              })
            );

            // Remove token from URL but keep staying on the same page
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('token');
            setSearchParams(newParams);
          } else {
            setValidationError('Invalid or expired token');
            setTimeout(() => {
              navigate('/patient/login');
              setValidationError(null);
            }, 2000);
          }
        })
        .catch((error) => {
          console.error('Token validation error:', error);
          setValidationError(
            error.response?.data?.message || 'Failed to validate token'
          );
          setTimeout(() => {
            navigate('/patient/login');
            setValidationError(null);
          }, 2000);
        })
        .finally(() => {
          setIsValidating(false);
        });
    }
  }, [searchParams, dispatch, navigate, setSearchParams]);

  if (isValidating) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="h6">Validating your access...</Typography>
      </Box>
    );
  }

  if (validationError) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h6" color="error">
          {validationError}
        </Typography>
        <Typography variant="body2">Redirecting to login...</Typography>
      </Box>
    );
  }

  return <AppRouter />;
}

export default App;
