import { Box, Typography } from '@mui/material';
import { get } from 'lodash';
import { useLocation } from 'react-router-dom';

const PatientPaymentCancelled = () => {
  const { state } = useLocation();

  return (
    <Box>
      <Box>
        <Typography variant="h5" mb={2}>
          Payment Cancelled
        </Typography>
        <Typography variant="h6" mb={2}>
          Cancelled Amount: {state ? get(state, ['amount'], 'N/A') : 'N/A'}
          {' USD'}
        </Typography>
        <Typography variant="h6" mb={2}>
          Protocol Number:
          {state ? get(state, ['details', 'protocol_id'], 'N/A') : 'N/A'}
        </Typography>
        <Typography variant="h6" mb={2}>
          Protocol Type:
          {state ? get(state, ['details', 'protocol_type'], 'N/A') : 'N/A'}
        </Typography>
      </Box>
    </Box>
  );
};

export default PatientPaymentCancelled;
