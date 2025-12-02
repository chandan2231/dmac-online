import './index.css';
import { Box, Typography, Card, CardContent, Divider } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { get } from 'lodash';
import Grid from '@mui/material/GridLegacy';

const PatientPaymentSuccess = () => {
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
            bgcolor: '#f0fdf4',
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
          <Typography
            variant="h4"
            fontWeight="bold"
            color="success.main"
            gutterBottom
          >
            Payment Successful!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Transaction ID: {get(state, ['orderID'], 'N/A')}
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
                Amount Paid
              </Typography>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
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

export default PatientPaymentSuccess;
