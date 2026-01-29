import './index.css';
import { Box, Typography, Card, CardContent, Divider } from '@mui/material';
import { Button, Stack } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from 'lodash';
import Grid from '@mui/material/GridLegacy';
import { ROUTES } from '../../../../router/router';

const PatientPaymentSuccess = () => {
  const location = useLocation();

  const PAYMENT_SUCCESS_STATE_KEY = 'paymentSuccessState';
  const PAYMENT_SUCCESS_RELOADED_KEY = 'paymentSuccessAutoReloaded';

  const paymentState = useMemo(() => {
    const stateFromRoute = location.state as unknown;
    if (stateFromRoute) return stateFromRoute;

    try {
      const raw = sessionStorage.getItem(PAYMENT_SUCCESS_STATE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { savedAt?: number; state?: unknown };
      const savedAt = Number(parsed?.savedAt ?? 0);
      if (!savedAt || Date.now() - savedAt > 10 * 60 * 1000) {
        sessionStorage.removeItem(PAYMENT_SUCCESS_STATE_KEY);
        return null;
      }
      return parsed?.state ?? null;
    } catch {
      return null;
    }
  }, [location.state]);

  useEffect(() => {
    if (!location.state) return;
    try {
      sessionStorage.setItem(
        PAYMENT_SUCCESS_STATE_KEY,
        JSON.stringify({ savedAt: Date.now(), state: location.state })
      );
    } catch {
      // ignore
    }
  }, [location.state]);

  const [didAutoReload, setDidAutoReload] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(PAYMENT_SUCCESS_RELOADED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [secondsLeft, setSecondsLeft] = useState<number>(10);

  const didAutoReloadRef = useRef(didAutoReload);
  useEffect(() => {
    didAutoReloadRef.current = didAutoReload;
  }, [didAutoReload]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev <= 1 ? 0 : prev - 1;

        // Auto-reload only once (prevents infinite reload loops), but keep the counter visible always.
        if (next === 0) {
          const canAutoReload = !didAutoReloadRef.current && !!paymentState;
          if (canAutoReload) {
            window.clearInterval(id);
            try {
              sessionStorage.setItem(PAYMENT_SUCCESS_RELOADED_KEY, 'true');
            } catch {
              // ignore
            }
            setDidAutoReload(true);
            window.location.reload();
            return 0;
          }

          // Keep showing a countdown even after the auto-reload has already happened.
          return 10;
        }

        return next;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [paymentState]);

  // After the first reload, redirect to Consent page.
  useEffect(() => {
    if (!didAutoReload) return;
    if (!paymentState) return;

    const timeoutId = window.setTimeout(() => {
      try {
        sessionStorage.removeItem(PAYMENT_SUCCESS_RELOADED_KEY);
      } catch {
        // ignore
      }
      window.location.assign(ROUTES.CONSENT);
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [didAutoReload, paymentState]);

  const handleGoToConsent = () => {
    try {
      sessionStorage.setItem(PAYMENT_SUCCESS_RELOADED_KEY, 'true');
    } catch {
      // ignore
    }
    window.location.assign(ROUTES.CONSENT);
  };

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
            Transaction ID: {get(paymentState, ['orderID'], 'N/A')}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{ mt: 1 }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: 'text.secondary', fontWeight: 700 }}
            >
              {!didAutoReload
                ? 'This page will reload after '
                : 'Redirecting to Consent page in '}
              <Box component="span" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {secondsLeft}s
              </Box>
              {' '}or click the button to reload manually.
            </Typography>

            <Button size="small" variant="text" onClick={handleGoToConsent}>
              Go to Consent
            </Button>
          </Stack>
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
                {get(paymentState, ['user', 'name'], 'N/A')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {get(paymentState, ['user', 'email'], 'N/A')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {get(paymentState, ['user', 'mobile'], 'N/A')}
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
                ${get(paymentState, ['product', 'product_amount'], '')}
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
                {get(paymentState, ['product', 'product_name'], '')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {get(paymentState, ['product', 'product_description'], '')}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PatientPaymentSuccess;
