import { get } from 'lodash';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Grid from '@mui/material/GridLegacy';
import MorenCard from '../../../components/card';
import PaymentService from '../payment.service';
import Loader from '../../../components/loader';

declare global {
  interface Window {
    paypal: any;
  }
}

const PatientPayment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem('user') || '{}');
    if (userDetails?.id) {
      setUser(userDetails);
    }
  }, []);

  useEffect(() => {
    if (state?.product?.product_amount) {
      setLoading(true);
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=AUJ2ExPRI7HOoaNHIxWP-3wngxA-Bk_Bxew7RpIUxlLBkJDEyCiSBruQntP3BCYxP3rxMxlm6UZg0zMs&components=buttons`;
      script.onload = () => {
        setLoading(false);
        window.paypal
          .Buttons({
            createOrder: async () => {
              const res = await PaymentService.createPayment(
                get(state, ['product', 'product_amount'], 0)
              );
              if (res.orderId) {
                return res.orderId;
              }
              return '';
            },
            onApprove: async (data: any) => {
              const { orderID, payerID } = data;
              const payload = {
                orderId: orderID,
                payerId: payerID,
                currencyCode: 'USD',
                amount: get(state, ['product', 'product_amount'], 0),
                protocolId: get(state, ['product', 'product_id'], ''),
                researchType: get(
                  state,
                  ['product', 'product_description'],
                  ''
                ),
                userId: get(user, 'id', ''),
              };
              const response = await PaymentService.capturePayment(payload);
              if (response) {
                navigate('/payment-success', {
                  state: {
                    details: state.product,
                    amount: get(state, ['product', 'product_amount'], 0),
                  },
                });
              }
            },
            onCancel: async () => {
              await PaymentService.cancelPayment();
              navigate('/payment-cancelled', {
                state: {
                  details: state.product,
                  amount: get(state, ['product', 'product_amount'], 0),
                },
              });
            },
            onError: (err: any) => {
              console.error('PayPal Checkout onError', err);
            },
          })
          .render('#paypal-button-container');
      };
      document.body.appendChild(script);
    }
  }, [state, user, navigate]);

  return (
    <Grid container spacing={4} sx={{ p: 4 }}>
      {loading && <Loader />}
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
