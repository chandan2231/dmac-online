import { get } from 'lodash';
import type { IProduct } from '../../admin/admin.interface';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material';
import { useGetProductListing } from '../../admin/hooks/useGetProductListing';
import { ROUTES } from '../../auth/auth.interface';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { useGetSubscribedProduct } from '../hooks/useGetSubscribedProduct';
import CustomLoader from '../../../components/loader';

const ProductCard = ({
  hideButton = false,
  ...args
}: IProduct & { index: number; hideButton?: boolean }) => {
  const navigate = useNavigate();
  const { user: userDetails } = useSelector((state: RootState) => state.auth);
  const {
    product_name,
    product_description,
    product_amount,
    id: product_id,
  } = args;

  const user = {
    id: get(userDetails, 'id'),
    name: get(userDetails, 'name'),
    email: get(userDetails, 'email'),
    mobile: get(userDetails, 'phone'),
  };
  const product = {
    product_amount,
    product_id,
    product_name,
    product_description,
  };

  const stateData = {
    user,
    product,
  };

  const handleBuyClick = () => {
    navigate(ROUTES.PATIENT_PAYMENT, { state: { ...stateData } });
  };

  return (
    <Card
      sx={{
        flex: '1 1 calc(50% - 16px)',
        maxWidth: 'calc(50% - 16px)',
      }}
    >
      <CardContent
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography variant="body2">{product_description}</Typography>
        <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
          {product_name}
        </Typography>
      </CardContent>
      {!hideButton && (
        <CardActions sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            size="small"
            variant="contained"
            onClick={() => handleBuyClick()}
            sx={{
              width: 100,
            }}
          >
            BUY
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

const PatientProducts = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, error } = useGetProductListing();
  const {
    data: subscribedProducts,
    isLoading: isSubscribedProductsLoading,
    error: subscribedProductsError,
  } = useGetSubscribedProduct(user);

  if (isLoading || isSubscribedProductsLoading) {
    return <CustomLoader />;
  }

  if (error || subscribedProductsError) {
    return null;
  }

  if (Array.isArray(subscribedProducts) && subscribedProducts.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          p: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
            gap: 2,
          }}
        >
          {((get(data, 'data', []) as IProduct[]) ?? []).map(
            (product: IProduct, index: number) => (
              <ProductCard key={index} index={index} {...product} />
            )
          )}
        </Box>
      </Box>
    );
  }

  if (
    Array.isArray(subscribedProducts) &&
    subscribedProducts.length > 0 &&
    Array.isArray(get(data, 'data'))
  ) {
    const firstSubscribedProduct = subscribedProducts[0];
    const filteredProduct = (get(data, 'data', []) as IProduct[]).filter(
      (product: IProduct) =>
        String(get(firstSubscribedProduct, [0, 'id'])) ===
        String(get(product, 'id'))
    );

    return (
      <Box
        sx={{
          height: '100%',
          p: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
            gap: 2,
          }}
        >
          {filteredProduct.map((product: IProduct, index: number) => (
            <ProductCard key={index} index={index} {...product} hideButton />
          ))}
        </Box>
      </Box>
    );
  }

  return null;
};

export default PatientProducts;
