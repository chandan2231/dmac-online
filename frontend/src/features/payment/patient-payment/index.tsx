import { get } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import { ROUTES } from '../../../router/router';
import Grid from '@mui/material/GridLegacy';
import PaymentService from '../payment.service';
import Loader from '../../../components/loader';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

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
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
        Checkout
      </Typography>
      <Grid container spacing={4}>
        {/* LEFT SECTION - User Details */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, height: '100%', boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <PersonOutlineIcon color="primary" /> User Details
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {get(state, ['user', 'name'], 'N/A')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {get(state, ['user', 'email'], 'N/A')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Mobile
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {get(state, ['user', 'mobile'], 'N/A')}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT SECTION - Product Details */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              height: '100%',
              boxShadow: 3,
              position: 'relative',
              overflow: 'visible',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="start"
                mb={2}
              >
                <Box>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    fontWeight="bold"
                  >
                    PRODUCT
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {get(state, ['product', 'product_name'], '')}
                  </Typography>
                </Box>
                <Chip
                  label={`$${get(state, ['product', 'product_amount'], '')}`}
                  color="primary"
                  sx={{ fontWeight: 'bold', fontSize: '1rem', height: 32 }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" paragraph>
                {get(state, ['product', 'product_description'], '')}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {get(state, ['product', 'subscription_list'], '') && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Features included:
                  </Typography>
                  <Stack spacing={1}>
                    {(
                      get(state, ['product', 'subscription_list'], '') as string
                    )
                      .split(',')
                      .map((feature: string, index: number) => (
                        <Box
                          key={index}
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          <CheckCircleOutlineIcon
                            color="success"
                            fontSize="small"
                          />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* PAYPAL BUTTON */}
        <Grid
          item
          xs={12}
          sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}
        >
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <div ref={paypalRef} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientPayment;
