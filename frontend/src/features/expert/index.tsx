import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useToast } from '../../providers/toast-provider';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { get } from 'lodash';
import { useDispatch } from 'react-redux';
import { updateUser } from '../auth/auth.slice';
import MorenButton from '../../components/button';
import ExpertService from './expert.service';

const ExportHome = () => {
  const { showToast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const handleGoogleAuth = async () => {
    const resp = await ExpertService.getGoogleAuthUrl();
    if (resp.success && resp.url) {
      window.location.href = resp.url; // 👈 open Google login
    } else {
      showToast('Failed to connect with Google', 'error');
    }
  };

  useEffect(() => {
    // Read the URL parameters to check for Google Auth response
    const urlParams = new URLSearchParams(window.location.search);
    const googleAuthStatus = urlParams.get('googleAuth');
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (googleAuthStatus === 'success' && accessToken && refreshToken) {
      showToast('Google Calendar Connected Successfully', 'success');
      dispatch(
        updateUser({
          google_access_token: accessToken,
          google_refresh_token: refreshToken,
        })
      );
      // Clear the URL parameters after processing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [dispatch, showToast]);

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
      }}
    >
      {get(user, 'google_access_token') && get(user, 'google_refresh_token') ? (
        <Box sx={{ fontSize: '16px', fontWeight: '500', color: 'green', p: 4 }}>
          Google Calendar is already connected with your account. 🎉
        </Box>
      ) : (
        <Box sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Why we use Google Calendar
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Connecting your Google Calendar helps make your consultations
            seamless and organized.
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Benefits for you:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <li>
              <Typography variant="body2">
                No double bookings — we only show time slots when you're really
                available.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Automatic reminders — confirmed consultations are added to your
                calendar instantly.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Time-zone accuracy — all sessions are shown in your local time.
              </Typography>
            </li>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Your privacy matters
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            We only request permission to view your availability and add
            consultation events. We never modify or delete your personal
            calendar events. You can disconnect anytime from settings.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <MorenButton
              variant="contained"
              onClick={() => handleGoogleAuth()}
              sx={{
                maxWidth: '300px',
              }}
            >
              Auth With Google
            </MorenButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ExportHome;
