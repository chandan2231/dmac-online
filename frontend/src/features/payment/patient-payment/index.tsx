import { get } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { ROUTES } from '../../../router/router';
import Grid from '@mui/material/GridLegacy';
import PaymentService from '../payment.service';
import MorenCard from '../../../components/card';
import Loader from '../../../components/loader';

const PatientPayment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [loading, setLoading] = useState(false);

  /** PayPal container reference */
  const paypalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!state) return;

    const productAmount = get(state, ['product', 'product_amount']);
    const productId = get(state, ['product', 'product_id']);
    const userId = get(state, ['user', 'id']);
    const userName = get(state, ['user', 'name']);
    const userEmail = get(state, ['user', 'email']);
    const productName = get(state, ['product', 'product_name']);

    const valid =
      productAmount && productId && userId && userName && productName;

    if (!valid) return;
    if (!paypalRef.current) return;

    const PAYPAL_ENV = import.meta.env.VITE_PAYPAL_ENV;
    const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    const clientId = PAYPAL_ENV === 'sandbox' ? PAYPAL_CLIENT_ID : '';

    /** Function to render PayPal Buttons */
    const renderPayPalButtons = () => {
      if (!window.paypal || !paypalRef.current) return;

      // Prevent multiple renders
      if (paypalRef.current.children.length > 0) return;

      // Clean container
      paypalRef.current.innerHTML = '';

      window.paypal
        .Buttons({
          createOrder: async () => {
            const response = await PaymentService.createPayment(productAmount);
            return response?.orderId;
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
              userId,
              productId,
              userName,
              productName,
              userEmail,
            };

            const result = await PaymentService.capturePayment(payload);
            if (result) {
              navigate(ROUTES.PATIENT_PAYMENT_SUCCESS, {
                state: { ...state, orderID: orderID },
              });
            }
          },

          onCancel: async () => {
            await PaymentService.cancelPayment();
            navigate(ROUTES.PATIENT_PAYMENT_CANCELLED, { state });
          },

          onError: (err: unknown) => {
            console.error('PayPal Error:', err);
          },
        })
        .render(paypalRef.current);
    };

    setLoading(true);

    /** Load PayPal SDK only once */
    const existingScript = document.getElementById('paypal-sdk');

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons`;
      script.onload = () => {
        setLoading(false);
        renderPayPalButtons();
      };
      document.body.appendChild(script);
    } else {
      setLoading(false);
      renderPayPalButtons();
    }
  }, [state, navigate]);

  if (loading) return <Loader />;

  return (
    <Grid container spacing={4} sx={{ p: 4 }}>
      {/* LEFT SECTION */}
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

            <Typography sx={{ color: 'text.secondary' }}>
              Email: {get(state, ['user', 'email'], 'N/A')}
            </Typography>

            <Typography sx={{ color: 'text.secondary' }}>
              Mobile: {get(state, ['user', 'mobile'], 'N/A')}
            </Typography>
          </Box>
        </MorenCard>
      </Grid>

      {/* RIGHT SECTION */}
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
            <Typography sx={{ color: 'text.secondary' }}>
              Description: {get(state, ['product', 'product_description'], '')}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Amount: ${get(state, ['product', 'product_amount'], '')}
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
        <div ref={paypalRef} style={{ width: '300px' }} />
      </Grid>
    </Grid>
  );
};

export default PatientPayment;
