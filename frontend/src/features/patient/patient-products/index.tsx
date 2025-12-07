import './index.css';
import { get } from 'lodash';
import type { IProduct } from '../../admin/admin.interface';
import { Box, Button, Typography, Chip, Stack } from '@mui/material';
import { useGetProductListing } from '../../admin/hooks/useGetProductListing';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { useGetSubscribedProduct } from '../hooks/useGetSubscribedProduct';
import { ROUTES } from '../../../router/router';
import CustomLoader from '../../../components/loader';
import moment from 'moment';
import { TabHeaderLayout } from '../../../components/tab-header';

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
          p: 3,
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
          p: 3,
        }}
      >
        <TabHeaderLayout
          leftNode={
            <Box
              sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'center' }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                }}
              >
                Subscribed Product Details
              </Typography>
            </Box>
          }
        />

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
                subscription_list,
              } = product;
              return (
                <div className="plan" key={index}>
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

                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      width="100%"
                    >
                      <Box flex={1}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{
                            fontSize: '16px',
                          }}
                        >
                          Subscription Status
                        </Typography>
                        <Chip
                          label={status}
                          size="small"
                          color={
                            String(status).toLowerCase() === 'completed'
                              ? 'success'
                              : 'warning'
                          }
                          sx={{
                            fontWeight: 600,
                            borderRadius: 1,
                            mb: 2,
                            color: '#fff',
                          }}
                        />
                      </Box>
                      <Box flex={1}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{
                            fontSize: '16px',
                          }}
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
                          sx={{
                            fontSize: '16px',
                          }}
                        >
                          Payment Date
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {moment(payment_date).format('Do MMMM, YYYY')}
                        </Typography>
                      </Box>
                    </Stack>

                    <div className="action"></div>
                  </div>
                </div>
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
