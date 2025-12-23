import './index.css';
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
} from '@mui/material';
import { ROUTES } from '../../../router/router';
import Grid from '@mui/material/GridLegacy';
import PaymentService from '../payment.service';
import Loader from '../../../components/loader';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GenericModal from '../../../components/modal';
import MorenCheckbox from '../../../components/checkbox';

const PatientPayment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [acknowledged, setAcknowledged] = useState(false);
  const [isAcknowledgementOpen, setIsAcknowledgementOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [paypalSdkReady, setPaypalSdkReady] = useState(false);

  /** PayPal container reference */
  const paypalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!state) return;

    const productAmount = get(state, ['product', 'product_amount']);
    const productId = get(state, ['product', 'product_id']);
    const userId = get(state, ['user', 'id']);
    const userName = get(state, ['user', 'name']);
    const productName = get(state, ['product', 'product_name']);

    const valid =
      productAmount && productId && userId && userName && productName;

    if (!valid) return;
    if (!paypalRef.current) return;

    const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    const clientId = PAYPAL_CLIENT_ID;

    if (!clientId) {
      console.error('Missing PayPal client id (VITE_PAYPAL_CLIENT_ID).');
      return;
    }

    // If the SDK is already present (e.g. from a previous visit), mark ready.
    if (window.paypal) {
      setPaypalSdkReady(true);
      setLoading(false);
      return;
    }

    setLoading(true);

    const scriptId = 'paypal-sdk';
    const existingScript = document.getElementById(
      scriptId
    ) as HTMLScriptElement | null;

    const onLoad = () => {
      setPaypalSdkReady(true);
      setLoading(false);
    };

    const onError = (err: unknown) => {
      console.error('Failed to load PayPal SDK:', err);
      setLoading(false);
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
        clientId
      )}&components=buttons`;
      script.addEventListener('load', onLoad);
      script.addEventListener('error', onError);
      document.body.appendChild(script);
    } else {
      existingScript.addEventListener('load', onLoad);
      existingScript.addEventListener('error', onError);
    }

    return () => {
      existingScript?.removeEventListener('load', onLoad);
      existingScript?.removeEventListener('error', onError);
    };
  }, [state, navigate]);

  useEffect(() => {
    if (!paypalSdkReady) return;
    if (!state) return;
    if (!paypalRef.current) return;
    if (!window.paypal) return;

    const container = paypalRef.current;

    const productAmount = get(state, ['product', 'product_amount']);
    const productId = get(state, ['product', 'product_id']);
    const userId = get(state, ['user', 'id']);
    const userName = get(state, ['user', 'name']);
    const userEmail = get(state, ['user', 'email']);
    const productName = get(state, ['product', 'product_name']);

    const valid =
      productAmount && productId && userId && userName && productName;

    if (!valid) return;

    container.innerHTML = '';

    const buttons = window.paypal.Buttons({
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
    });

    buttons.render(container);

    return () => {
      try {
        buttons.close?.();
      } catch {
        // ignore
      }
      container.innerHTML = '';
    };
  }, [paypalSdkReady, state, navigate]);

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      {loading && <Loader />}
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
            <div className="plan">
              <div className="inner">
                <span className="pricing">
                  <span>{`$${get(state, ['product', 'product_amount'], '')}`}</span>
                </span>
                <p className="title">
                  {get(state, ['product', 'product_name'], '')}
                </p>
                <p className="info">
                  {get(state, ['product', 'product_description'], '')}
                </p>
                <ul className="features">
                  {(get(state, ['product', 'subscription_list'], '') as string)
                    .split(',')
                    .map((feature, index) => (
                      <li key={index}>
                        <span className="icon">
                          <svg
                            height="24"
                            width="24"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M0 0h24v24H0z" fill="none"></path>
                            <path
                              fill="currentColor"
                              d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"
                            ></path>
                          </svg>
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </Card>
        </Grid>

        {/* PAYPAL BUTTON */}
        <Grid
          item
          xs={12}
          sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}
        >
          <Box sx={{ width: '100%', maxWidth: 400, position: 'relative' }}>
            {!acknowledged && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 1000000,
                }}
                onClick={e => {
                  e.preventDefault();
                  setIsAcknowledgementOpen(true);
                }}
              />
            )}
            <div ref={paypalRef} />
          </Box>
        </Grid>
      </Grid>

      <GenericModal
        isOpen={isAcknowledgementOpen}
        onClose={() => setIsAcknowledgementOpen(false)}
        title="Payment Acknowledged"
        onSubmit={() => setIsAcknowledgementOpen(false)}
        children={
          <Box>
            <Typography variant="body1">
              This is to acknowledge that I have read and understood that I need
              to complete the payment through PayPal to proceed with the
              purchase.
            </Typography>
            {/* Check box */}
            <Box
              mt={2}
              display="flex"
              alignItems="center"
              gap={1}
              onClick={() => setAcknowledged(!acknowledged)}
              sx={{ cursor: 'pointer' }}
            >
              <MorenCheckbox checked={acknowledged} />
              <Typography variant="body2">
                I acknowledge that I have completed the payment.
              </Typography>
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default PatientPayment;
