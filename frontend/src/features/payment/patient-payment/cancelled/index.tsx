import './index.css';
import { Box, Typography, Card, CardContent, Divider } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { get } from 'lodash';
import Grid from '@mui/material/GridLegacy';

const PatientPaymentCancelled = () => {
  const { state } = useLocation();

  return (
    <Box
      sx={{
        p: 4,
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: '100%',
          borderRadius: 4,
          boxShadow: 3,
          overflow: 'visible',
        }}
      >
        <Box
          sx={{
            bgcolor: '#fef2f2',
            p: 4,
            textAlign: 'center',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <Box
            component="span"
            className="success-animation"
            sx={{
              display: 'block',
              width: '100px',
              height: '100px',
              margin: '0 auto',
              mb: 2,
            }}
          >
            <svg
              viewBox="0 0 400 400"
              style={{ width: '100%', height: '100%' }}
            >
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
          <Typography
            variant="h4"
            fontWeight="bold"
            color="error.main"
            gutterBottom
          >
            Payment Cancelled
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            The transaction was cancelled.
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight="bold"
              >
                Customer
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {get(state, ['user', 'name'], 'N/A')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {get(state, ['user', 'email'], 'N/A')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {get(state, ['user', 'mobile'], 'N/A')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight="bold"
              >
                Amount
              </Typography>
              <Typography variant="h4" color="text.primary" fontWeight="bold">
                ${get(state, ['product', 'product_amount'], '')}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight="bold"
              >
                Product
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {get(state, ['product', 'product_name'], '')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {get(state, ['product', 'product_description'], '')}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PatientPaymentCancelled;
