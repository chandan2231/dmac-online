import { get } from 'lodash';
import { useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useCreatePayment } from '../hooks/useCreatePayment';
import Grid from '@mui/material/GridLegacy';
import MorenCard from '../../../components/card';
import Loader from '../../../components/loader';

const PatientPayment = () => {
  const { state } = useLocation();
  const { loading, paymentSuccess, paymentCancelled } = useCreatePayment(state);

  if (loading) {
    return <Loader />;
  }

  if (paymentSuccess) {
    return <div>Payment Success</div>;
  }

  if (paymentCancelled) {
    return <div>Payment Cancelled</div>;
  }

  return (
    <Grid container spacing={4} sx={{ p: 4 }}>
      {/* LEFT SECTION — USER DETAILS */}
      <Grid item xs={12} md={6}>
        <MorenCard
          title="User Details"
          description="Review your information"
          minHeight={'100%'}
        >
          <Box display="flex" flexDirection="column">
            <Typography variant="h6" fontWeight="bold">
              Name: {state ? get(state, ['user', 'name'], '') : 'N/A'}
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Email: {state ? get(state, ['user', 'email'], '') : 'N/A'}
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Mobile: {state ? get(state, ['user', 'mobile'], '') : 'N/A'}
            </Typography>
          </Box>
        </MorenCard>
      </Grid>

      {/* RIGHT SECTION — PRODUCT DETAILS */}
      <Grid item xs={12} md={6}>
        <MorenCard
          title="Product Details"
          description="Review your selected product"
          minHeight={'100%'}
        >
          <Box display="flex" flexDirection="column">
            <Typography variant="h6" fontWeight="bold">
              Product Name:{' '}
              {state ? get(state, ['product', 'product_name'], '') : ''}
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Product Description:{' '}
              {state ? get(state, ['product', 'product_description'], '') : ''}
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Product Amount: $
              {state ? get(state, ['product', 'product_amount'], '') : ''}
            </Typography>
          </Box>
        </MorenCard>
      </Grid>

      <Grid
        item
        xs={12}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 2,
        }}
      >
        <div id="paypal-button-container" style={{ width: '300px' }}></div>
      </Grid>
    </Grid>
  );
};

export default PatientPayment;
