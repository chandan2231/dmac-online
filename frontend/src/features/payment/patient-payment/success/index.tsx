import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { get } from 'lodash';
import Grid from '@mui/material/GridLegacy';
import MorenCard from '../../../../components/card';

const PatientPaymentSuccess = () => {
  const { state } = useLocation();

  return (
    <Grid container spacing={4} sx={{ p: 4 }}>
      <Grid item xs={12}>
        <Typography variant="h5" mb={2} style={{ textAlign: 'center' }}>
          Payment Successfull
        </Typography>
      </Grid>

      {/* LEFT SECTION — USER DETAILS */}
      <Grid item xs={12} md={6}>
        <MorenCard
          title="User Details"
          description="Review your information"
          minHeight={'100%'}
        >
          <Box display="flex" flexDirection="column">
            <Typography variant="h6" fontWeight="bold">
              Name:{' '}
              {state ? get(state, ['stateProp', 'user', 'name'], '') : 'N/A'}
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Email:{' '}
              {state ? get(state, ['stateProp', 'user', 'email'], '') : 'N/A'}
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Mobile:{' '}
              {state ? get(state, ['stateProp', 'user', 'mobile'], '') : 'N/A'}
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
              {state
                ? get(state, ['stateProp', 'product', 'product_name'], '')
                : ''}
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Product Description:{' '}
              {state
                ? get(
                    state,
                    ['stateProp', 'product', 'product_description'],
                    ''
                  )
                : ''}
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Product Amount: $
              {state
                ? get(state, ['stateProp', 'product', 'product_amount'], '')
                : ''}
            </Typography>
          </Box>
        </MorenCard>
      </Grid>
    </Grid>
  );
};

export default PatientPaymentSuccess;
