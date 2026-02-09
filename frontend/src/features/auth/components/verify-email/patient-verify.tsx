import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { usePatientEmailVerification } from './hooks/usePatientVerification.ts';
import { ROUTES } from '../../../../router/router.ts';
import MorenCard from '../../../../components/card/index.tsx';
import MorenButton from '../../../../components/button/index.tsx';
import CustomLoader from '../../../../components/loader/index.tsx';

const PatientEmailVerification = () => {
  const navigate = useNavigate();

  const { loading, message } = usePatientEmailVerification();

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
        <MorenButton
          variant="contained"
          onClick={() => navigate(ROUTES.PATIENT_LOGIN)}
        >
          Go to Sign In
        </MorenButton>
      </Box>
    </MorenCard>
  );
};

export default PatientEmailVerification;
