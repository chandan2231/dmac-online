import './index.css';
import { get } from 'lodash';
import type { IProduct } from '../../admin/admin.interface';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import { useGetProductListing } from '../../admin/hooks/useGetProductListing';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { useGetSubscribedProduct } from '../hooks/useGetSubscribedProduct';
import { ROUTES } from '../../../router/router';
import CustomLoader from '../../../components/loader';

const ProductCard = ({ ...args }: IProduct) => {
  const navigate = useNavigate();
  const { user: userDetails } = useSelector((state: RootState) => state.auth);
  const {
    product_name,
    product_description,
    product_amount,
    subscription_list,
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
    subscription_list,
  };

  const stateData = {
    user,
    product,
  };

  const handleBuyClick = () => {
    navigate(ROUTES.PATIENT_PAYMENT, { state: { ...stateData } });
  };

  return (
    <div
      className="plan"
      style={{
        flex: '1 1 calc(33.33% - 16px)',
        maxWidth: 'calc(33.33% - 16px)',
      }}
    >
      <div className="inner">
        <span className="pricing">
          <span>${product_amount}</span>
        </span>
        <p className="title">{product_name}</p>
        <p className="info">{product_description}</p>
        <ul className="features">
          {subscription_list.split(',').map((feature, index) => (
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

        <div className="action">
          <Button variant="contained" onClick={() => handleBuyClick()}>
            Register
          </Button>
        </div>
      </div>
    </div>
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
          overflowY: 'auto',
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
              <ProductCard key={index} {...product} />
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
                <Card
                  key={index}
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 4,
                    transition: '0.3s',
                    '&:hover': { borderColor: 'primary.main' },
                    width: '100%',
                    mb: 2,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mb={2}
                    >
                      <Box>
                        <Typography
                          variant="overline"
                          color="text.secondary"
                          fontWeight="bold"
                          letterSpacing={1}
                        >
                          SUBSCRIPTION
                        </Typography>
                        <Typography variant="h5" fontWeight="800" gutterBottom>
                          {product_name}
                        </Typography>
                        <Chip
                          label={status}
                          size="small"
                          color={
                            String(status).toLowerCase() === 'succeeded' ||
                            String(status).toLowerCase() === 'active'
                              ? 'success'
                              : 'default'
                          }
                          sx={{ fontWeight: 600, borderRadius: 1 }}
                        />
                      </Box>
                      <Typography
                        variant="h4"
                        color="primary.main"
                        fontWeight="bold"
                      >
                        ${product_amount}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                    >
                      {product_description}
                    </Typography>

                    <Box
                      sx={{
                        bgcolor: 'grey.50',
                        p: 2,
                        borderRadius: 2,
                        mt: 2,
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                      >
                        <Box flex={1}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Transaction ID
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            sx={{ fontFamily: 'monospace' }}
                          >
                            {payment_id}
                          </Typography>
                        </Box>
                        <Box flex={1}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Payment Date
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {payment_date}
                          </Typography>
                        </Box>
                      </Stack>
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
