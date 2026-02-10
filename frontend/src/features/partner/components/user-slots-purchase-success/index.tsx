import { Box, Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { get } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../router/router';

const PartnerUserSlotsPurchaseSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const paymentState = useMemo(() => location.state as unknown, [location.state]);

  const [secondsLeft, setSecondsLeft] = useState<number>(10);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev <= 1 ? 0 : prev - 1;
        return next;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (secondsLeft !== 0) return;
    navigate(ROUTES.PARTNER_USERS, { replace: true, state: { refresh: true } });
  }, [secondsLeft, navigate]);

  const handleGoToUserList = () => {
    navigate(ROUTES.PARTNER_USERS, { replace: true, state: { refresh: true } });
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
      <Card sx={{ maxWidth: 680, width: '100%', borderRadius: 4, boxShadow: 3 }}>
        <Box
          sx={{
            bgcolor: '#f0fdf4',
            p: 4,
            textAlign: 'center',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="success.main" gutterBottom>
            Purchase Successful!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Order ID: {get(paymentState, ['orderID'], 'N/A')}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center" sx={{ mt: 1 }}>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              Redirecting to User List in{' '}
              <Box component="span" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {secondsLeft}s
              </Box>
            </Typography>

            <Button size="small" variant="text" onClick={handleGoToUserList}>
              Go to User List
            </Button>
          </Stack>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">
                Users Added
              </Typography>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {get(paymentState, ['addedUsers'], 'N/A')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">
                Amount Paid
              </Typography>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                ${get(paymentState, ['amount'], '')}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Your allowed user limit will be updated after successful payment. If you don’t see the updated numbers,
                please wait a few seconds and refresh the User List.
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PartnerUserSlotsPurchaseSuccess;
