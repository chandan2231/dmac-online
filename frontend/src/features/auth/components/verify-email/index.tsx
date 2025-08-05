import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useToast } from '../../../../providers/toast-provider/index.tsx';
import { ROUTES } from '../../auth.interface.ts';
import MorenCard from '../../../../components/card/index.tsx';
import MorenButton from '../../../../components/button/index.tsx';
import CustomLoader from '../../../../components/loader/index.tsx';
import AuthService from '../../auth.service.ts';

const EmailVerification = () => {
  const navigate = useNavigate();

  const { token } = useParams();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Verifying...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const payload = { token: String(token) };
        const response = await AuthService.getEmailVerification(payload);
        const { success, message } = response;

        if (success) {
          setMessage(message || 'Email verified successfully!');
          showToast('Email verified successfully!', 'success');
          navigate(ROUTES.LOGIN);
        } else {
          setMessage(message || 'Email verification failed.');
          showToast(message || 'Email verification failed.', 'error');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setMessage('An error occurred while verifying your email.');
        showToast('An error occurred while verifying your email.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (token && loading) {
      verifyEmail();
    }
  }, [loading, navigate, showToast, token]);

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <MorenCard
      title="Email Verification"
      description={`We're verifying your email address`}
      maxWidth={480}
    >
      <Box textAlign="start" mt={2}>
        <Typography variant="body1" mb={2}>
          {message}
        </Typography>
        <MorenButton variant="contained" onClick={() => navigate(ROUTES.LOGIN)}>
          Go to Sign In
        </MorenButton>
      </Box>
    </MorenCard>
  );
};

export default EmailVerification;
