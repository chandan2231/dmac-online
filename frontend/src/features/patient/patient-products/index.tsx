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
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          justifyContent: 'start',
          width: '100%',
          height: '100%',
          gap: 4,
          p: 4,
        }}
      >
        <Typography
          sx={{
            fontWeight: 'bold',
          }}
          variant="h5"
        >
          Subscribed Product Details
        </Typography>
        <Box>
          {subscribedProducts.map(
            (
              product: IProduct & {
                payment_id: string;
                status: string;
                payment_date: string;
              },
              index: number
            ) => {
              const {
                product_description,
                product_name,
                product_amount,
                payment_id,
                payment_date,
                status,
              } = product;
              return (
                <Card key={index}>
                  <CardContent
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'start',
                      flexDirection: 'column',
                      alignItems: 'start',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2">Product Name:</Typography>
                      <Typography
                        gutterBottom
                        sx={{ color: 'text.secondary', fontSize: 14 }}
                      >
                        {product_name}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2">
                        Product Description:
                      </Typography>
                      <Typography
                        gutterBottom
                        sx={{ color: 'text.secondary', fontSize: 14 }}
                      >
                        {product_description}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2">Product Amount:</Typography>
                      <Typography
                        gutterBottom
                        sx={{ color: 'text.secondary', fontSize: 14 }}
                      >
                        ${product_amount}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2">Transaction ID:</Typography>
                      <Typography
                        gutterBottom
                        sx={{ color: 'text.secondary', fontSize: 14 }}
                      >
                        {payment_id}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2">Payment Date:</Typography>
                      <Typography
                        gutterBottom
                        sx={{ color: 'text.secondary', fontSize: 14 }}
                      >
                        {payment_date}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2">Paymen Status:</Typography>
                      <Typography
                        gutterBottom
                        sx={{ color: 'text.secondary', fontSize: 14 }}
                      >
                        {status}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              );
            }
          )}
        </Box>
      </Box>
    );
  }

  return null;
};

export default PatientProducts;
