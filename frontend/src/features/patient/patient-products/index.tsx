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
import { useState } from 'react';

type UpgradeContext = {
  isUpgrade: boolean;
  upgradeFromProductId: number | null;
  currentProductAmount: number;
  fullProductAmount: number;
  amountToPay: number;
};

const ProductCard = ({
  upgradeContext,
  ...args
}: IProduct & { upgradeContext?: UpgradeContext }) => {
  const navigate = useNavigate();
  const { user: userDetails } = useSelector((state: RootState) => state.auth);
  const {
    product_name,
    product_description,
    product_amount,
    subscription_list,
    id: product_id,
  } = args;

  const payableAmount = upgradeContext?.amountToPay ?? Number(product_amount);

  const user = {
    id: get(userDetails, 'id'),
    name: get(userDetails, 'name'),
    email: get(userDetails, 'email'),
    mobile: get(userDetails, 'phone'),
  };
  const product = {
    product_amount: upgradeContext?.amountToPay ?? product_amount,
    product_id,
    product_name,
    product_description,
    subscription_list,
    ...(upgradeContext
      ? {
          full_product_amount: upgradeContext.fullProductAmount,
          current_product_amount: upgradeContext.currentProductAmount,
        }
      : {}),
  };

  const stateData = {
    user,
    product,
    ...(upgradeContext
      ? {
          upgrade: {
            isUpgrade: true,
            upgradeFromProductId: upgradeContext.upgradeFromProductId,
          },
        }
      : {}),
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
          <span>${payableAmount}</span>
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
            {upgradeContext?.isUpgrade ? 'Upgrade Product' : 'Register'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const isHigherTier = (current: IProduct | null, candidate: IProduct) => {
  if (!current) return true;

  const currentAmount =
    toNumberOrNull((current as UniversalType).product_amount) ?? 0;
  const candidateAmount =
    toNumberOrNull((candidate as UniversalType).product_amount) ?? 0;

  const currentPriority = toNumberOrNull(
    (current as UniversalType).upgrade_priority
  );
  const candidatePriority = toNumberOrNull(
    (candidate as UniversalType).upgrade_priority
  );
  const hasPriority = currentPriority !== null && candidatePriority !== null;

  return hasPriority
    ? candidatePriority < currentPriority
    : candidateAmount > currentAmount;
};

const buildUpgradeContext = (
  current: IProduct,
  target: IProduct
): UpgradeContext | null => {
  const currentAmount =
    toNumberOrNull((current as UniversalType).product_amount) ?? 0;
  const targetAmount =
    toNumberOrNull((target as UniversalType).product_amount) ?? 0;
  const amountToPay = Number((targetAmount - currentAmount).toFixed(2));
  if (!Number.isFinite(amountToPay) || amountToPay <= 0) return null;

  return {
    isUpgrade: true,
    upgradeFromProductId: Number(
      (current as UniversalType).product_id ??
        (current as UniversalType).id ??
        null
    ),
    currentProductAmount: currentAmount,
    fullProductAmount: targetAmount,
    amountToPay,
  };
};

const PatientProducts = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, error } = useGetProductListing();
  const {
    data: subscribedProducts,
    isLoading: isSubscribedProductsLoading,
    error: subscribedProductsError,
  } = useGetSubscribedProduct(user);

  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);

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
    const currentSubscribed = subscribedProducts[0] as unknown as IProduct;
    const allProducts = (get(data, 'data', []) as IProduct[]) ?? [];
    const currentProductId = Number(
      (currentSubscribed as UniversalType).id ??
        (currentSubscribed as UniversalType).product_id
    );

    const currentFromListing =
      allProducts.find(
        p => Number((p as UniversalType).id) === currentProductId
      ) ?? null;
    const currentForTier = (currentFromListing ??
      currentSubscribed) as IProduct;

    const currentPriority = toNumberOrNull(
      (currentForTier as UniversalType).upgrade_priority
    );
    const priorities = allProducts
      .map(p => toNumberOrNull((p as UniversalType).upgrade_priority))
      .filter((v): v is number => v !== null);
    const minPriority = priorities.length > 0 ? Math.min(...priorities) : null;
    const alreadyHighestByPriority =
      currentPriority !== null && minPriority !== null
        ? currentPriority <= minPriority
        : false;
    const upgradeOptions = allProducts
      .filter(p => Number((p as UniversalType).id) !== currentProductId)
      .filter(p => isHigherTier(currentForTier, p))
      .sort((a, b) => {
        const ap = toNumberOrNull((a as UniversalType).upgrade_priority);
        const bp = toNumberOrNull((b as UniversalType).upgrade_priority);
        if (ap !== null && bp !== null) return ap - bp;
        return (
          Number((a as UniversalType).product_amount) -
          Number((b as UniversalType).product_amount)
        );
      });

    const upgradeCards = upgradeOptions
      .map(p => ({
        product: p,
        ctx: buildUpgradeContext(currentSubscribed, p),
      }))
      .filter((x): x is { product: IProduct; ctx: UpgradeContext } => !!x.ctx);

    const currentAmount =
      toNumberOrNull((currentSubscribed as UniversalType).product_amount) ?? 0;
    const maxAmount = Math.max(
      0,
      ...allProducts.map(
        p => toNumberOrNull((p as UniversalType).product_amount) ?? 0
      )
    );

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
          overflowY: 'auto',
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
          rightNode={
            <Button
              variant="contained"
              onClick={() => setShowUpgradeOptions(v => !v)}
            >
              Upgrade Product
            </Button>
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

        {showUpgradeOptions ? (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              width: '100%',
              gap: 2,
              mt: 3,
            }}
          >
            {upgradeCards.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {alreadyHighestByPriority || currentAmount >= maxAmount
                  ? 'You already have the highest-tier product.'
                  : upgradeOptions.length > 0
                    ? 'Upgrade options exist, but they are not payable (check product amounts vs upgrade priority).'
                    : 'No higher-tier products available to upgrade.'}
              </Typography>
            ) : (
              upgradeCards.map(({ product: p, ctx: upgradeContext }, idx) => {
                return (
                  <ProductCard
                    key={idx}
                    {...p}
                    upgradeContext={upgradeContext}
                  />
                );
              })
            )}
          </Box>
        ) : null}
      </Box>
    );
  }

  return null;
};

export default PatientProducts;
