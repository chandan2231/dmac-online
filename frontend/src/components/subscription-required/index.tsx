import { Box, Typography, Button } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../router/router';

interface SubscriptionRequiredProps {
  title?: string;
  description?: string;
}

const SubscriptionRequired = ({
  title = 'Subscription Required',
  description = 'You need to purchase a subscription to access this feature.',
}: SubscriptionRequiredProps) => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="60vh"
      textAlign="center"
      p={3}
    >
      <Box
        sx={{
          bgcolor: 'action.hover',
          borderRadius: '50%',
          p: 3,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
      </Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4} maxWidth="sm">
        {description}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() =>
          navigate(ROUTES.PATIENT_PRODUCTS || ROUTES.PATIENT_PAYMENT)
        }
      >
        View Subscription Plans
      </Button>
    </Box>
  );
};

export default SubscriptionRequired;
