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
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ROUTES } from '../../../router/router';
import Grid from '@mui/material/GridLegacy';
import PaymentService from '../payment.service';
import Loader from '../../../components/loader';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GenericModal from '../../../components/modal';
import MorenCheckbox from '../../../components/checkbox';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

type FeatureKV = { title: string; value: string };

const parseProductFeature = (raw: unknown): FeatureKV[] => {
  if (Array.isArray(raw)) {
    return raw
      .filter(Boolean)
      .map(item => {
        const title = String(get(item, 'title', '')).trim();
        const value = String(get(item, 'value', '')).trim();
        return { title, value };
      })
      .filter(item => item.title.length > 0);
  }

  if (typeof raw === 'string') {
    const text = raw.trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text) as unknown;
      return parseProductFeature(parsed);
    } catch {
      return [];
    }
  }

  return [];
};

const renderYesNoValue = (rawValue: string) => {
  const normalized = String(rawValue ?? '')
    .trim()
    .toLowerCase();

  if (normalized === 'yes') {
    return <CheckCircleIcon sx={{ color: 'success.main' }} fontSize="small" />;
  }

  if (normalized === 'no') {
    return <CancelIcon sx={{ color: 'error.main' }} fontSize="small" />;
  }

  return (
    <Typography variant="body2" sx={{ fontWeight: 600 }}>
      {rawValue}
    </Typography>
  );
};

const PatientPayment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const theme = useTheme();
  const [acknowledged, setAcknowledged] = useState(false);
  const [isAcknowledgementOpen, setIsAcknowledgementOpen] = useState(false);

  const [serverAmountToPay, setServerAmountToPay] = useState<number | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [paypalSdkReady, setPaypalSdkReady] = useState(false);

  /** PayPal container reference */
  const paypalRef = useRef<HTMLDivElement | null>(null);

  const acknowledgedRef = useRef(false);
  const serverAmountToPayRef = useRef<number | null>(null);
  const serverUpgradeFromProductIdRef = useRef<number | null>(null);

  useEffect(() => {
    acknowledgedRef.current = acknowledged;
  }, [acknowledged]);

  useEffect(() => {
    if (!state) {
      navigate(ROUTES.PATIENT_PRODUCTS, { replace: true });
      return;
    }

    const productId = get(state, ['product', 'product_id']);
    const userId = get(state, ['user', 'id']);
    const userName = get(state, ['user', 'name']);
    const productName = get(state, ['product', 'product_name']);

    const valid = productId && userId && userName && productName;
    if (!valid) {
      navigate(ROUTES.PATIENT_PRODUCTS, { replace: true });
      return;
    }
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

    const productId = get(state, ['product', 'product_id']);
    const userId = get(state, ['user', 'id']);
    const userName = get(state, ['user', 'name']);
    const userEmail = get(state, ['user', 'email']);
    const productName = get(state, ['product', 'product_name']);

    const valid = productId && userId && userName && productName;

    if (!valid) return;

    container.innerHTML = '';

    const buttons = window.paypal.Buttons({
      createOrder: async () => {
        const response = await PaymentService.createPayment({
          userId,
          productId,
        });
        if (!response?.success || !response.orderId) {
          throw new Error(response?.message || 'PAYMENT_CREATE_FAILED');
        }

        // Always prefer server-computed values for robust upgrades.
        if (Number.isFinite(response.amountToPay ?? NaN)) {
          const amt = Number(response.amountToPay);
          serverAmountToPayRef.current = amt;
          setServerAmountToPay(amt);
        }
        const upgradeFrom =
          response.upgradeFromProductId !== undefined
            ? Number(response.upgradeFromProductId)
            : null;
        const upgradeFromSafe = Number.isFinite(upgradeFrom) ? upgradeFrom : null;
        serverUpgradeFromProductIdRef.current = upgradeFromSafe;

        return response.orderId;
      },

      onApprove: async (data: unknown) => {
        const { orderID, payerID } = data as {
          orderID: string;
          payerID: string;
        };

        const uiAmount = Number(get(state, ['product', 'product_amount'], 0));
        const amount =
          serverAmountToPayRef.current !== null &&
          Number.isFinite(serverAmountToPayRef.current)
            ? Number(serverAmountToPayRef.current)
            : uiAmount;

        const payload = {
          orderId: orderID,
          payerId: payerID,
          currencyCode: 'USD',
          userId,
          userName,
          productName,
          userEmail,
          productId,
          amount,
          upgradeFromProductId:
            serverUpgradeFromProductIdRef.current ??
            get(state, ['upgrade', 'upgradeFromProductId'], null),
        };

        try {
          const result = await PaymentService.capturePayment(payload);
          if (result) {
            navigate(ROUTES.PATIENT_PAYMENT_SUCCESS, {
              state: { ...state, orderID: orderID },
            });
          }
        } catch (err) {
          console.error('Payment capture failed:', err);
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

  const triggerPayPalClick = () => {
    const root = paypalRef.current;
    if (!root) return;

    const candidate =
      (root.querySelector('button') as HTMLButtonElement | null) ??
      (root.querySelector('[role="button"]') as HTMLElement | null);

    if (candidate) {
      candidate.click();
      return;
    }

    // Fallback: if PayPal renders non-button wrappers.
    (root as unknown as HTMLElement).click?.();
  };

  const handleAcknowledgeCancel = () => {
    setIsAcknowledgementOpen(false);
  };

  const handleAcknowledgeConfirm = () => {
    if (!acknowledgedRef.current) return;
    setIsAcknowledgementOpen(false);

    // Open the PayPal flow as a direct result of the Confirm click.
    requestAnimationFrame(() => {
      triggerPayPalClick();
    });
  };

  const product = get(state, ['product']);
  const parsedFeature = parseProductFeature(get(product, 'feature'));
  const subscriptionList: string[] = String(
    get(product, 'subscription_list', '')
  )
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const amountToShow =
    serverAmountToPay !== null && Number.isFinite(serverAmountToPay)
      ? serverAmountToPay
      : get(product, 'product_amount', 0);

  return (
    <Box
      sx={{
        bgcolor: theme.palette.grey[50],
        py: { xs: 1.25, md: 1.75 },
        px: { xs: 2, md: 4 },
        width: '100%',
      }}
    >
      {loading && <Loader />}
      <Box
        sx={{
          width: '100%',
        }}
      >
        <Paper
          variant="outlined"
          sx={{ borderRadius: 3, boxShadow: 2, overflow: 'hidden' }}
        >
          <Box
            sx={{
              px: { xs: 2, md: 2.75 },
              py: { xs: 1.4, md: 1.8 },
              borderBottom: `1px solid ${theme.palette.divider}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Checkout
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Review your details and complete the payment via PayPal.
            </Typography>
          </Box>

          <Box sx={{ px: { xs: 2, md: 2.75 }, py: { xs: 1.6, md: 2.2 } }}>
            <Grid container spacing={2} alignItems="flex-start">
              {/* LEFT SECTION - Product Details + PayPal */}
              <Grid item xs={12} md={8}>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      px: 1.75,
                      py: 1.6,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      color: theme.palette.primary.contrastText,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      flexWrap="wrap"
                      gap={2}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 900,
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {get(product, 'product_name', '')}
                        </Typography>
                        {get(product, 'product_description') ? (
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.5,
                              opacity: 0.92,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {get(product, 'product_description', '')}
                          </Typography>
                        ) : null}
                      </Box>

                      <Stack alignItems="flex-end" spacing={1}>
                        <Chip
                          label="Pending Payment"
                          color="warning"
                          size="small"
                          sx={{
                            fontWeight: 900,
                            color: '#fff',
                            fontSize: 11,
                            height: 24,
                            px: 1.25,
                          }}
                        />
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800 }}
                        >
                          Amount to pay: ${Number(amountToShow ?? 0).toFixed(2)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>

                  <Box sx={{ p: 1.75 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 900, mb: 1 }}
                    >
                      Included Features
                    </Typography>

                    {Array.isArray(parsedFeature) && parsedFeature.length ? (
                      <TableContainer
                        component={Paper}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          boxShadow: 'none',
                          overflow: 'hidden',
                        }}
                      >
                        <Table size="small">
                          <TableBody>
                            {parsedFeature.map((feature, idx) => (
                              <TableRow
                                key={`${String(feature.title)}-${idx}`}
                                sx={{ '&:last-child td': { borderBottom: 0 } }}
                              >
                                <TableCell sx={{ fontWeight: 800 }}>
                                  {feature.title}
                                </TableCell>
                                <TableCell align="right">
                                  {renderYesNoValue(feature.value)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : subscriptionList.length > 0 ? (
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                          },
                          gap: 1,
                        }}
                      >
                        {subscriptionList.map((feature, idx) => (
                          <Stack
                            key={`${feature}-${idx}`}
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              border: themeArg =>
                                `1px solid ${themeArg.palette.divider}`,
                              bgcolor: themeArg =>
                                themeArg.palette.background.default,
                            }}
                          >
                            <CheckCircleIcon
                              fontSize="small"
                              sx={{ color: 'success.main' }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700 }}
                            >
                              {feature}
                            </Typography>
                          </Stack>
                        ))}
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        No feature details available.
                      </Typography>
                    )}

                    <Divider sx={{ my: 1.5 }} />
                  </Box>
                </Paper>
              </Grid>

              {/* RIGHT SECTION - User Details + Payment Summary */}
              <Grid item xs={12} md={4}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: themeArg => `1px solid ${themeArg.palette.divider}`,
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <PersonOutlineIcon color="primary" /> User Details
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Stack spacing={1.25}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Name
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {get(state, ['user', 'name'], 'N/A')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {get(state, ['user', 'email'], 'N/A')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Mobile
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {get(state, ['user', 'mobile'], 'N/A')}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Payment summary below user details */}
                    <Box
                      sx={{
                        mt: 2,
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, mb: 0.5 }}
                      >
                        Payment Details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Amount to pay:{' '}
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          ${Number(amountToShow ?? 0).toFixed(2)}
                        </Box>
                      </Typography>
                    </Box>

                    {/* PayPal buttons below payment summary */}
                    <Box
                      sx={{
                        mt: 1.75,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 900, mb: 1 }}
                      >
                        Complete Payment
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Click the PayPal button below to complete your
                        purchase.
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 260,
                          position: 'relative',
                          mt: 0.5,
                        }}
                      >
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
                              e.stopPropagation();
                              setIsAcknowledgementOpen(true);
                            }}
                          />
                        )}
                        <div ref={paypalRef} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <GenericModal
        isOpen={isAcknowledgementOpen}
        onClose={handleAcknowledgeCancel}
        title="Payment Acknowledged"
        cancelButtonText="Cancel"
        submitButtonText="Confirm"
        submitDisabled={!acknowledged}
        onCancel={handleAcknowledgeCancel}
        onSubmit={handleAcknowledgeConfirm}
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
    </Box>
  );
};

export default PatientPayment;
