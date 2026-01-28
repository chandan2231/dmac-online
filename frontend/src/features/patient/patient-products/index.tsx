import './index.css';
import { get } from 'lodash';
import type { IProduct } from '../../admin/admin.interface';
import {
  Box,
  Button,
  Typography,
  Chip,
  Stack,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';
import { useGetProductListing } from '../../admin/hooks/useGetProductListing';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { useGetSubscribedProduct } from '../hooks/useGetSubscribedProduct';
import { ROUTES } from '../../../router/router';
import CustomLoader from '../../../components/loader';
import moment from 'moment';
import { TabHeaderLayout } from '../../../components/tab-header';
import { useRef, useState } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const parseProductFeature = (raw: unknown) => {
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

type UpgradeContext = {
  isUpgrade: boolean;
  upgradeFromProductId: number | null;
  currentProductAmount: number;
  fullProductAmount: number;
  amountToPay: number;
};

type FeatureKV = { title: string; value: string };

const getProductFeaturePairs = (product: IProduct): FeatureKV[] => {
  const fromFeature = parseProductFeature(
    get(product as UniversalType, 'feature')
  );
  if (Array.isArray(fromFeature) && fromFeature.length > 0) return fromFeature;

  const subscriptionList = String(
    get(product as UniversalType, 'subscription_list', '')
  )
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (subscriptionList.length === 0) return [];

  return subscriptionList.map(title => ({ title, value: 'Yes' }));
};

const getValueForTitle = (product: IProduct, title: string): string => {
  const normalizedTitle = title.trim().toLowerCase();
  const pairs = getProductFeaturePairs(product);
  const match = pairs.find(
    item => (item?.title ?? '').trim().toLowerCase() === normalizedTitle
  );
  return (match?.value ?? '').toString();
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
  const navigate = useNavigate();
  const theme = useTheme();
  const { data, isLoading, error } = useGetProductListing();
  const {
    data: subscribedProducts,
    isLoading: isSubscribedProductsLoading,
    error: subscribedProductsError,
  } = useGetSubscribedProduct(user);

  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleToggleUpgrade = () => {
    setShowUpgradeOptions(v => !v);
    requestAnimationFrame(() => {
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  if (isLoading || isSubscribedProductsLoading) {
    return <CustomLoader />;
  }

  if (error || subscribedProductsError) {
    return null;
  }

  if (Array.isArray(subscribedProducts) && subscribedProducts.length === 0) {
    const allProducts = ((get(data, 'data', []) as IProduct[]) ?? [])
      .slice()
      .sort((a, b) => {
        const ap = toNumberOrNull((a as UniversalType).upgrade_priority);
        const bp = toNumberOrNull((b as UniversalType).upgrade_priority);
        if (ap !== null && bp !== null) return ap - bp;
        return (
          Number((a as UniversalType).product_amount) -
          Number((b as UniversalType).product_amount)
        );
      });

    const orderedTitles: string[] = [];
    const seenTitles = new Set<string>();
    for (const product of allProducts) {
      const featureList = getProductFeaturePairs(product);
      for (const feature of featureList) {
        const title = (feature?.title ?? '').trim();
        if (!title) continue;
        if (/^price$/i.test(title)) continue;
        if (!seenTitles.has(title)) {
          seenTitles.add(title);
          orderedTitles.push(title);
        }
      }
    }

    const columnColors: Array<'primary'> = ['primary'];

    return (
      <Box
        sx={{
          height: '100%',
          p: 3,
          overflowY: 'auto',
        }}
      >
        <TabHeaderLayout
          leftNode={
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
              }}
            >
              Available Products
            </Typography>
          }
          rightNode={null}
        />

        {allProducts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No products available.
          </Typography>
        ) : (
          <Box sx={{ width: '100%', mt: 0 }}>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                width: '100%',
                overflowX: 'auto',
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch',
                position: 'relative',
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Table
                size="small"
                sx={{
                  minWidth: { xs: 900, md: 0 },
                  tableLayout: { xs: 'auto', md: 'fixed' },
                  width: '100%',
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        width: { xs: 180, sm: 240, md: 280 },
                        minWidth: { xs: 180, sm: 240, md: 280 },
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                        bgcolor: theme.palette.background.paper,
                        borderRight: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Feature
                      </Typography>
                    </TableCell>

                    {allProducts.map((product, index) => {
                      const color = columnColors[index % columnColors.length];
                      const palette = theme.palette[color];
                      const displayAmount = Number(
                        (product as UniversalType).product_amount ?? 0
                      ).toFixed(2);

                      return (
                        <TableCell
                          key={String(
                            (product as UniversalType).id ??
                              (product as UniversalType).product_id ??
                              index
                          )}
                          align="center"
                          sx={{
                            p: 0,
                            height: 'auto',
                            borderLeft: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: palette.main,
                              minHeight: 170,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 0.75,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 700,
                                lineHeight: 1.15,
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                color: palette.contrastText,
                                textAlign: 'center',
                              }}
                            >
                              {(product as UniversalType).product_name}
                            </Typography>

                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.25,
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: palette.contrastText,
                              }}
                            >
                              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                                ${displayAmount}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 700, opacity: 0.95 }}
                              >
                                Price
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {orderedTitles.map(title => (
                    <TableRow
                      key={title}
                      sx={{
                        height: 56,
                        '&:nth-of-type(odd)': {
                          bgcolor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          height: 56,
                          position: 'sticky',
                          left: 0,
                          zIndex: 2,
                          bgcolor: theme.palette.background.paper,
                          borderRight: `1px solid ${theme.palette.divider}`,
                          width: { xs: 180, sm: 240, md: 280 },
                          minWidth: { xs: 180, sm: 240, md: 280 },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {title}
                        </Typography>
                      </TableCell>

                      {allProducts.map((product, idx) => {
                        const value = getValueForTitle(product, title) || '-';
                        return (
                          <TableCell
                            key={`${title}-${idx}`}
                            align="center"
                            sx={{
                              height: 56,
                              borderLeft: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            {renderYesNoValue(value)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}

                  <TableRow>
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        bgcolor: theme.palette.background.paper,
                        borderRight: `1px solid ${theme.palette.divider}`,
                        width: { xs: 180, sm: 240, md: 280 },
                        minWidth: { xs: 180, sm: 240, md: 280 },
                      }}
                    />

                    {allProducts.map((product, index) => {
                      const color = columnColors[index % columnColors.length];

                      return (
                        <TableCell key={`cta-${index}`} align="center">
                          <Button
                            fullWidth
                            color={color}
                            variant="contained"
                            onClick={() => {
                              const userDetails = (user as UniversalType) ?? {};
                              const userPayload = {
                                id: get(userDetails, 'id'),
                                name: get(userDetails, 'name'),
                                email: get(userDetails, 'email'),
                                mobile: get(userDetails, 'phone'),
                              };

                              const parsedFeature = getProductFeaturePairs(product);
                              const productPayload = {
                                product_amount: (product as UniversalType).product_amount,
                                product_id:
                                  (product as UniversalType).id ??
                                  (product as UniversalType).product_id,
                                product_name: (product as UniversalType).product_name,
                                product_description:
                                  (product as UniversalType).product_description,
                                subscription_list:
                                  (product as UniversalType).subscription_list,
                                feature: parsedFeature,
                              };
                              const stateData = {
                                user: userPayload,
                                product: productPayload,
                              };

                              navigate(ROUTES.PATIENT_PAYMENT, {
                                state: stateData,
                              });
                            }}
                            sx={{
                              py: 1.25,
                              fontWeight: 800,
                              borderRadius: 999,
                            }}
                          >
                            REGISTER
                          </Button>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
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

    const productsForUpgradeTable: Array<{
      product: IProduct;
      ctx: UpgradeContext;
    }> = upgradeCards.map(x => ({ product: x.product, ctx: x.ctx }));

    const orderedTitles: string[] = [];
    const seenTitles = new Set<string>();
    for (const item of productsForUpgradeTable) {
      const featureList = getProductFeaturePairs(item.product);
      for (const feature of featureList) {
        const title = (feature?.title ?? '').trim();
        if (!title) continue;
        if (/^price$/i.test(title)) continue;
        if (!seenTitles.has(title)) {
          seenTitles.add(title);
          orderedTitles.push(title);
        }
      }
    }

    const columnColors: Array<'primary'> = ['primary'];

    return (
      <Box
        ref={containerRef}
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
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
              }}
            >
              Subscribed Product Details
            </Typography>
          }
          rightNode={
            <Button
              variant="contained"
              onClick={handleToggleUpgrade}
              startIcon={showUpgradeOptions ? <ArrowBackIcon /> : undefined}
            >
              {showUpgradeOptions ? 'Back' : 'Upgrade Product'}
            </Button>
          }
        />

        {showUpgradeOptions ? (
          <Box
            sx={{
              width: '100%',
              mt: 0,
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
              <Box sx={{ width: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Available Upgrade Options
                </Typography>

                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    width: '100%',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                    position: 'relative',
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  <Table
                    size="small"
                    sx={{
                      minWidth: { xs: 900, md: 0 },
                      tableLayout: { xs: 'auto', md: 'fixed' },
                      width: '100%',
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            width: { xs: 180, sm: 240, md: 280 },
                            minWidth: { xs: 180, sm: 240, md: 280 },
                            position: 'sticky',
                            left: 0,
                            zIndex: 3,
                            bgcolor: theme.palette.background.paper,
                            borderRight: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            Feature
                          </Typography>
                        </TableCell>
                        {productsForUpgradeTable.map((item, index) => {
                          const color =
                            columnColors[index % columnColors.length];
                          const palette = theme.palette[color];

                          const displayAmount = Number(
                            item.ctx.amountToPay ?? 0
                          ).toFixed(2);

                          return (
                            <TableCell
                              key={String(
                                (item.product as UniversalType).id ??
                                  (item.product as UniversalType).product_id ??
                                  index
                              )}
                              align="center"
                              sx={{
                                p: 0,
                                bgcolor: palette.main,
                                color: palette.contrastText,
                                borderLeft: `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              <Box
                                sx={{
                                  p: 1.5,
                                  minHeight: 170,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 0.75,
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 700,
                                    lineHeight: 1.15,
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 2,
                                    overflow: 'hidden',
                                    color: palette.contrastText,
                                    textAlign: 'center',
                                  }}
                                >
                                  {(item.product as UniversalType).product_name}
                                </Typography>

                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.25,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: palette.contrastText,
                                  }}
                                >
                                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                                    ${displayAmount}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 700, opacity: 0.95 }}
                                  >
                                    To Pay
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {orderedTitles.map(title => (
                        <TableRow
                          key={title}
                          sx={{
                            height: 56,
                            '&:nth-of-type(odd)': {
                              bgcolor: theme.palette.action.hover,
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              height: 56,
                              position: 'sticky',
                              left: 0,
                              zIndex: 2,
                              bgcolor: theme.palette.background.paper,
                              borderRight: `1px solid ${theme.palette.divider}`,
                              width: { xs: 180, sm: 240, md: 280 },
                              minWidth: { xs: 180, sm: 240, md: 280 },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {title}
                            </Typography>
                          </TableCell>
                          {productsForUpgradeTable.map((item, idx) => {
                            const value =
                              getValueForTitle(item.product, title) || '-';

                            return (
                              <TableCell
                                key={`${title}-${idx}`}
                                align="center"
                                sx={{
                                  height: 56,
                                  borderLeft: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                {renderYesNoValue(value)}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}

                      <TableRow>
                        <TableCell
                          sx={{
                            position: 'sticky',
                            left: 0,
                            zIndex: 2,
                            bgcolor: theme.palette.background.paper,
                            borderRight: `1px solid ${theme.palette.divider}`,
                            width: { xs: 180, sm: 240, md: 280 },
                            minWidth: { xs: 180, sm: 240, md: 280 },
                          }}
                        />

                        {productsForUpgradeTable.map((item, index) => {
                          const color =
                            columnColors[index % columnColors.length];

                          return (
                            <TableCell key={`cta-${index}`} align="center">
                              <Button
                                fullWidth
                                color={color}
                                variant="contained"
                                onClick={() => {
                                  // Reuse existing payment flow by delegating to ProductCard payload logic.
                                  // Minimal: render the same state expected by the payment route.
                                  const userDetails =
                                    (user as UniversalType) ?? {};
                                  const userPayload = {
                                    id: get(userDetails, 'id'),
                                    name: get(userDetails, 'name'),
                                    email: get(userDetails, 'email'),
                                    mobile: get(userDetails, 'phone'),
                                  };

                                  const parsedFeature = getProductFeaturePairs(
                                    item.product
                                  );
                                  const productPayload = {
                                    product_amount: item.ctx.amountToPay,
                                    product_id:
                                      (item.product as UniversalType).id ??
                                      (item.product as UniversalType)
                                        .product_id,
                                    product_name: (
                                      item.product as UniversalType
                                    ).product_name,
                                    product_description: (
                                      item.product as UniversalType
                                    ).product_description,
                                    subscription_list: (
                                      item.product as UniversalType
                                    ).subscription_list,
                                    feature: parsedFeature,
                                    full_product_amount:
                                      item.ctx.fullProductAmount,
                                    current_product_amount:
                                      item.ctx.currentProductAmount,
                                  };
                                  const stateData = {
                                    user: userPayload,
                                    product: productPayload,
                                    upgrade: {
                                      isUpgrade: true,
                                      upgradeFromProductId:
                                        item.ctx.upgradeFromProductId,
                                    },
                                  };

                                  navigate(ROUTES.PATIENT_PAYMENT, {
                                    state: stateData,
                                  });
                                }}
                                sx={{
                                  py: 1.25,
                                  fontWeight: 800,
                                  borderRadius: 999,
                                }}
                              >
                                UPGRADE
                              </Button>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              mt: 2,
              display: 'grid',
              gridTemplateColumns:
                subscribedProducts.length > 2
                  ? { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }
                  : subscribedProducts.length > 1
                    ? { xs: '1fr', md: 'repeat(2, 1fr)' }
                    : '1fr',
              gap: 2,
            }}
          >
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

                const parsedFeature = parseProductFeature(
                  get(product, ['feature'])
                ) as Array<{ title: string; value: string }>;

                const subscriptionList = String(
                  get(product as UniversalType, 'subscription_list', '')
                )
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean);

                const isCompleted =
                  String(status).toLowerCase() === 'completed';
                const statusColor = isCompleted ? 'success' : 'warning';
                const statusLabel = isCompleted ? 'Active' : status;
                const amountText = `$${Number(product_amount ?? 0).toFixed(2)}`;
                const rawPaymentStatus = String(status ?? '').trim();
                const paymentStatusLabel = rawPaymentStatus;
                const paymentStatusColor = isCompleted
                  ? theme.palette.success.light
                  : theme.palette.error.light;
                const statusChipSx = {
                  fontWeight: 900,
                  color: '#fff',
                  fontSize: isCompleted ? 16 : 12,
                  height: isCompleted ? 36 : 28,
                  px: isCompleted ? 1.75 : 1.15,
                };

                return (
                  <Paper
                    key={index}
                    variant="outlined"
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      borderColor: 'divider',
                      transition: 'transform 120ms ease, box-shadow 120ms ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        px: 2,
                        py: 2,
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
                            variant="h6"
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
                            {product_name}
                          </Typography>
                          {product_description ? (
                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.75,
                                opacity: 0.92,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {product_description}
                            </Typography>
                          ) : null}
                        </Box>

                        <Chip
                          label={statusLabel}
                          size="medium"
                          color={statusColor}
                          sx={statusChipSx}
                        />
                      </Stack>
                    </Box>

                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          borderRadius: 2.5,
                          overflow: 'hidden',
                          borderColor: alpha(theme.palette.primary.main, 0.35),
                        }}
                      >
                        <Box
                          sx={{
                            px: 2,
                            py: 1.25,
                            background: `linear-gradient(135deg, ${alpha(
                              theme.palette.primary.main,
                              0.92
                            )} 0%, ${alpha(
                              theme.palette.primary.dark,
                              0.92
                            )} 100%)`,
                            color: theme.palette.primary.contrastText,
                            overflowX: 'auto',
                            WebkitOverflowScrolling: 'touch',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns:
                                'repeat(4, minmax(200px, 1fr))',
                              gap: 1.5,
                              alignItems: 'stretch',
                              minWidth: 920,
                            }}
                          >
                            <Box
                              sx={{
                                p: 1.25,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.common.white, 0.12),
                                border: `1px solid ${alpha(
                                  theme.palette.common.white,
                                  0.24
                                )}`,
                                minWidth: 0,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.92, fontWeight: 800, fontSize: 13.5 }}
                              >
                                Transaction ID
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontWeight: 900,
                                  fontSize: 14.5,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {payment_id}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                p: 1.25,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.common.white, 0.12),
                                border: `1px solid ${alpha(
                                  theme.palette.common.white,
                                  0.24
                                )}`,
                                minWidth: 0,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.92, fontWeight: 800, fontSize: 13.5 }}
                              >
                                Amount Paid
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 900, whiteSpace: 'nowrap', fontSize: 16 }}
                              >
                                {amountText}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                p: 1.25,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.common.white, 0.12),
                                border: `1px solid ${alpha(
                                  theme.palette.common.white,
                                  0.24
                                )}`,
                                minWidth: 0,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.92, fontWeight: 800, fontSize: 13.5 }}
                              >
                                Payment Date
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 900, whiteSpace: 'nowrap', fontSize: 14.5 }}
                              >
                                {moment(payment_date).format('Do MMMM, YYYY')}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                p: 1.25,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.common.white, 0.12),
                                border: `1px solid ${alpha(
                                  theme.palette.common.white,
                                  0.24
                                )}`,
                                minWidth: 0,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.92, fontWeight: 800, fontSize: 13.5 }}
                              >
                                Payment Status
                              </Typography>
                              {paymentStatusLabel ? (
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: 900,
                                    fontSize: 14.5,
                                    whiteSpace: 'nowrap',
                                    color: paymentStatusColor,
                                  }}
                                >
                                  {paymentStatusLabel}
                                </Typography>
                              ) : null}
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Box>

                    <Box sx={{ p: 2 }}>
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
                                  sx={{
                                    '&:last-child td': { borderBottom: 0 },
                                  }}
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
                                border: `1px solid ${theme.palette.divider}`,
                                bgcolor: theme.palette.background.default,
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
                        <Typography variant="body2" color="text.secondary">
                          No feature details available.
                        </Typography>
                      )}

                    </Box>
                  </Paper>
                );
              }
            )}
          </Box>
        )}
      </Box>
    );
  }

  return null;
};

export default PatientProducts;
