import { get } from 'lodash';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useCreatePayment } from '../hooks/useCreatePayment';
import { ROUTES } from '../../auth/auth.interface';
import PaymentService from '../payment.service';
import Grid from '@mui/material/GridLegacy';
import MorenCard from '../../../components/card';
import Loader from '../../../components/loader';

const PatientPayment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { loading, scriptReady } = useCreatePayment(state);

  // --- RENDER PAYPAL BUTTONS WHEN SCRIPT + DOM ARE READY ---
  useEffect(() => {
    if (!scriptReady) return;

    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    const productAmount = get(state, ['product', 'product_amount']);
    const productId = get(state, ['product', 'product_id']);
    const userId = get(state, ['user', 'id']);
    const userName = get(state, ['user', 'name']);
    const userEmail = get(state, ['user', 'email']);
    const productName = get(state, ['product', 'product_name']);

    window.paypal
      .Buttons({
        createOrder: async () => {
          try {
            const response = await PaymentService.createPayment(productAmount);
            if (response?.orderId) {
              return response.orderId; // Use backend orderId
            } else {
              throw new Error('Order ID not found in backend response.');
            }
          } catch (error) {
            console.error('Error creating PayPal order:', error);
          }
        },

        onApprove: async (data: unknown) => {
          const { orderID, payerID } = data as {
            orderID: string;
            payerID: string;
          };
          const payload = {
            orderId: orderID,
            payerId: payerID,
            currencyCode: 'USD',
            amount: productAmount,
            userId: userId,
            productId: productId,
            userName: userName,
            productName: productName,
            userEmail: userEmail,
          };

          const response = await PaymentService.capturePayment(payload);

          navigate(ROUTES.PATIENT_PAYMENT_SUCCESS, {
            state: { ...response, stateProp: state },
          });
        },

        onCancel: async () => {
          await PaymentService.cancelPayment();
          navigate(ROUTES.PATIENT_PAYMENT_CANCELLED, {
            state: { stateProp: state },
          });
        },

        onError: (err: unknown) => {
          console.error('PayPal Checkout Error:', err);
        },
      })
      .render('#paypal-button-container');
  }, [scriptReady, state, navigate]);

  // --- Loader until script + data are ready ---
  if (loading) {
    return <Loader />;
  }

  return (
    <Grid container spacing={4} sx={{ p: 4 }}>
      {/* LEFT SECTION — USER DETAILS */}
      <Grid item xs={12} md={6}>
        <MorenCard
          title="User Details"
          description="Review your information"
          minHeight="100%"
        >
          <Box display="flex" flexDirection="column">
            <Typography variant="h6" fontWeight="bold">
              Name: {get(state, ['user', 'name'], 'N/A')}
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Email: {get(state, ['user', 'email'], 'N/A')}
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Mobile: {get(state, ['user', 'mobile'], 'N/A')}
            </Typography>
          </Box>
        </MorenCard>
      </Grid>

      {/* RIGHT SECTION — PRODUCT DETAILS */}
      <Grid item xs={12} md={6}>
        <MorenCard
          title="Product Details"
          description="Review your selected product"
          minHeight="100%"
        >
          <Box display="flex" flexDirection="column">
            <Typography variant="h6" fontWeight="bold">
              Product Name: {get(state, ['product', 'product_name'], '')}
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Product Description:{' '}
              {get(state, ['product', 'product_description'], '')}
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Product Amount: ${get(state, ['product', 'product_amount'], '')}
            </Typography>
          </Box>
        </MorenCard>
      </Grid>

      {/* PAYPAL BUTTON */}
      <Grid
        item
        xs={12}
        sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}
      >
        <div id="paypal-button-container" style={{ width: '300px' }}></div>
      </Grid>
    </Grid>
  );
};

export default PatientPayment;
