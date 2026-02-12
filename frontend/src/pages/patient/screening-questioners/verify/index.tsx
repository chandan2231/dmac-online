import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ScreeningAuthApi from '../../../../services/screeningAuthApi';
import { setScreeningUser } from '../../../../features/patient/screening-questioners/storage';
import { ROUTES } from '../../../../router/router';
import LanguageService from '../../../../i18n/language.service';
import { setLocalStorageItem } from '../../../../utils/functions';
import { LOCAL_STORAGE_KEYS } from '../../../../utils/constants';

const ScreeningVerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying...');

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setMessage('Missing token');
        return;
      }

      try {
        const res = await ScreeningAuthApi.verifyEmail(token);
        if (!res.isSuccess || !res.user) {
          setMessage(res.message || 'Verification failed');
          return;
        }

        setScreeningUser(res.user);

        try {
          const langCode = 'en';
          const langRes = await LanguageService.fetchLanguageContants(langCode);
          if (langRes?.isSuccess) {
            setLocalStorageItem(
              LOCAL_STORAGE_KEYS.LANGUAGE_CONSTANTS,
              JSON.stringify(langRes.data)
            );
          }
        } catch {
          // non-blocking: verification succeeded even if texts fail
        }

        setMessage('Verified! Redirecting...');
        setTimeout(() => navigate(ROUTES.SCREENING_QUESTIONERS), 600);
      } catch {
        setMessage('Verification failed');
      }
    };

    run();
  }, [token, navigate]);

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Typography variant="h6">{message}</Typography>
    </Box>
  );
};

export default ScreeningVerifyEmailPage;
