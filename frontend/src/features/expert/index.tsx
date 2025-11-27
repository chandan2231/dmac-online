import { useEffect } from 'react';
import { Box } from '@mui/material';
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
    await ExpertService.getGoogleAuthUrl();
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
    <Box>
      {get(user, 'google_access_token') && get(user, 'google_refresh_token') ? (
        <Box sx={{ fontSize: '16px', fontWeight: '500', color: 'green' }}>
          Google Calendar is already connected with your account. 🎉
        </Box>
      ) : (
        <MorenButton variant="contained" onClick={() => handleGoogleAuth()}>
          Auth With Google
        </MorenButton>
      )}
    </Box>
  );
};

export default ExportHome;
