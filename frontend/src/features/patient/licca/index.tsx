import { useSelector } from 'react-redux';
import { Box, Button, Paper, Typography } from '@mui/material';
import type { RootState } from '../../../store';
import CustomLoader from '../../../components/loader';
import SubscriptionRequired from '../../../components/subscription-required';
import { useGetSubscribedProduct } from '../hooks/useGetSubscribedProduct';

const LiccaSubscription = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const liccaUrl = import.meta.env.VITE_LICCA_URL as string | undefined;

  const { data: products, isLoading: loadingProducts } =
    useGetSubscribedProduct(user);

  const productPackageSubscriptionListString =
    products && products.length > 0 ? products[0].subscription_list : null;

  const handleGoToLicca = () => {
    if (!liccaUrl) {
      window.alert('LICCA URL is not configured. Please set VITE_LICCA_URL.');
      return;
    }

    window.open(liccaUrl, '_blank', 'noopener,noreferrer');
  };

  if (loadingProducts) {
    return <CustomLoader />;
  }

  if (
    !productPackageSubscriptionListString ||
    !productPackageSubscriptionListString.includes('LICCA Subscription')
  ) {
    return (
      <Box p={3} height="100%" width="100%">
        <SubscriptionRequired
          title="Subscription Required"
          description="You need to purchase a subscription to access LICCA."
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
        LICCA Subscription
      </Typography>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: theme => `1px solid ${theme.palette.divider}`,
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Button variant="contained" size="large" onClick={handleGoToLicca}>
          Go to LICCA
        </Button>
      </Paper>
    </Box>
  );
};

export default LiccaSubscription;
