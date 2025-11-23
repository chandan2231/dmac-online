import './index.css';
import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { get } from 'lodash';
import Grid from '@mui/material/GridLegacy';
import MorenCard from '../../../../components/card';

const PatientPaymentSuccess = () => {
  const { state } = useLocation();

  return (
    <Grid container spacing={4} sx={{ p: 4 }}>
      <Grid
        item
        xs={12}
        gap={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Box
          component="span"
          className="success-animation"
          sx={{
            display: 'block',
            width: '150px',
            height: '150px',
            margin: '0 auto',
          }}
        >
          <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%' }}>
            <circle
              fill="none"
              stroke="#68E534"
              strokeWidth="20"
              cx="200"
              cy="200"
              r="190"
              strokeLinecap="round"
              transform="rotate(-90 200 200)"
              className="circle"
            />
            <polyline
              fill="none"
              stroke="#68E534"
              points="88,214 173,284 304,138"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="tick"
            />
          </svg>
        </Box>
        <Box>
          <Typography
            variant="h4"
            style={{ textAlign: 'center', fontWeight: 'bold' }}
            mb={4}
          >
            Payment Successfull
          </Typography>
          <Typography
            variant="h6"
            style={{ textAlign: 'center', fontWeight: 'bold' }}
          >
            Transaction ID: {get(state, ['orderID'], 'N/A')}
          </Typography>
        </Box>
      </Grid>

      {/* LEFT SECTION — USER DETAILS */}
      <Grid item xs={12} md={6}>
        <MorenCard
          title="User Details"
          description="Review your information"
          minHeight={'100%'}
          descriptionVariant="h6"
        >
          <Box display="flex" flexDirection="column">
            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Name:
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {state ? get(state, ['user', 'name'], '') : 'N/A'}
              </Typography>
            </Box>

            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Email:{' '}
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {state ? get(state, ['user', 'email'], '') : 'N/A'}
              </Typography>
            </Box>

            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Mobile:{' '}
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {state ? get(state, ['user', 'mobile'], '') : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </MorenCard>
      </Grid>

      {/* RIGHT SECTION — PRODUCT DETAILS */}
      <Grid item xs={12} md={6}>
        <MorenCard
          title="Product Details"
          description="Review your selected product"
          minHeight={'100%'}
          descriptionVariant="h6"
        >
          <Box display="flex" flexDirection="column">
            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Product Name:{' '}
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {state ? get(state, ['product', 'product_name'], '') : ''}{' '}
              </Typography>
            </Box>

            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Product Description:{' '}
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {state
                  ? get(state, ['product', 'product_description'], '')
                  : ''}{' '}
              </Typography>
            </Box>

            <Box display="flex" flexDirection="row" alignItems="center">
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Product Amount: $
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {state
                  ? get(state, ['product', 'product_amount'], '')
                  : ''}{' '}
              </Typography>
            </Box>
          </Box>
        </MorenCard>
      </Grid>
    </Grid>
  );
};

export default PatientPaymentSuccess;
