import { get } from 'lodash';
import { useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import MorenCard from '../../../components/card';
import MorenButton from '../../../components/button';

const PatientPayment = () => {
  const { state } = useLocation();

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
        sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}
      >
        {state
          ? get(state, ['product', 'product_id'], null) && (
              <MorenButton
                variant="contained"
                color="primary"
                sx={{
                  maxWidth: 300,
                }}
              >
                Proceed to Payment
              </MorenButton>
            )
          : null}
      </Grid>
    </Grid>
  );
};

export default PatientPayment;
