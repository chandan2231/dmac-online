import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { ROUTES } from '../../auth.interface.ts';
import { useEmailVerification } from './hooks/useEmailVerification.ts';
import MorenCard from '../../../../components/card/index.tsx';
import MorenButton from '../../../../components/button/index.tsx';
import CustomLoader from '../../../../components/loader/index.tsx';

const EmailVerification = () => {
  const navigate = useNavigate();

  const { loading, message } = useEmailVerification();

  if (loading) return <CustomLoader />;

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
