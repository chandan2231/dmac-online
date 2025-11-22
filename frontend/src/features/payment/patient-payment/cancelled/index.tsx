import './index.css';
import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { get } from 'lodash';
import Grid from '@mui/material/GridLegacy';
import MorenCard from '../../../../components/card';

const PatientPaymentCancelled = () => {
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
            {/* Circle animation stays the same */}
            <circle
              fill="none"
              stroke="#E53935"
              strokeWidth="20"
              cx="200"
              cy="200"
              r="190"
              strokeLinecap="round"
              transform="rotate(-90 200 200)"
              className="circle"
            />

            {/* Cross line 1 */}
            <line
              x1="120"
              y1="120"
              x2="280"
              y2="280"
              stroke="#E53935"
              strokeWidth="24"
              strokeLinecap="round"
              className="cross-line-1"
            />

            {/* Cross line 2 */}
            <line
              x1="280"
              y1="120"
              x2="120"
              y2="280"
              stroke="#E53935"
              strokeWidth="24"
              strokeLinecap="round"
              className="cross-line-2"
            />
          </svg>
        </Box>
        <Box>
          <Typography
            variant="h4"
            style={{ textAlign: 'center', fontWeight: 'bold' }}
          >
            Payment Cancelled
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

            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
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

export default PatientPaymentCancelled;
