import CustomLoader from '../../../components/loader';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useGetProductListing } from '../../admin/hooks/useGetProductListing';
import { get } from 'lodash';
import type { IProduct, IProductFeature } from '../../admin/admin.interface';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../router/router';

type PricingComparisionProps = {
  selectedCountryCode?: string;
};

function PricingComparision({ selectedCountryCode }: PricingComparisionProps) {
  const { data, isLoading, error } = useGetProductListing();
  const navigate = useNavigate();
  const theme = useTheme();

  const HEADER_CELL_HEIGHT = 100;
  const FEATURE_ROW_HEIGHT = 56;
  const FIRST_COL_WIDTH = 280;

  if (isLoading) {
    return <CustomLoader />;
  }

  if (error) {
    return null;
  }
  // test comment
  const products = ((get(data, 'data', []) as IProduct[]) ?? [])
    .slice()
    .sort(
      (a, b) =>
        Number(a.upgrade_priority ?? a.id) - Number(b.upgrade_priority ?? b.id)
    );

  const orderedTitles: string[] = [];
  const seenTitles = new Set<string>();

  for (const product of products) {
    const featureList = (product.feature ?? []) as IProductFeature[];
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

  const columnColors: Array<
    'success' | 'info' | 'secondary' | 'warning' | 'primary'
  > = ['success', 'info', 'secondary', 'warning', 'primary'];

  const yesNoPill = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (normalized !== 'yes' && normalized !== 'no') return null;

    const isYes = normalized === 'yes';
    const bg = isYes ? theme.palette.success.light : theme.palette.error.light;

    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 1.25,
          py: 0.5,
          borderRadius: 999,
          bgcolor: bg,
          color: theme.palette.common.white,
          fontWeight: 700,
          fontSize: 12,
          minWidth: '40%',
        }}
      >
        {isYes ? 'Yes' : 'No'}
      </Box>
    );
  };

  const getValueForTitle = (product: IProduct, title: string) => {
    const match = (product.feature ?? []).find(
      item => (item?.title ?? '').trim() === title
    );
    return (match?.value ?? '').toString();
  };

  const getDisplayPrice = (product: IProduct) => {
    const fallbackAmount = Number(product.product_amount);
    const fallback = {
      symbol: '$',
      amount: Number.isFinite(fallbackAmount) ? fallbackAmount : 0,
    };

    if (!selectedCountryCode) return fallback;

    const match = (product.country_amounts ?? []).find(
      item => (item?.country_code ?? '').trim() === selectedCountryCode
    );
    const amount = Number(match?.amount);
    if (!match || !Number.isFinite(amount)) return fallback;

    return {
      symbol: match.currency_symbol || '$',
      amount,
    };
  };

  const handleBuy = (product: IProduct) => {
    navigate(ROUTES.PATIENT_REGISTRATION, {
      state: {
        ...product,
      },
    });
  };

  const productColumnWidth =
    products.length > 0
      ? `calc((100% - ${FIRST_COL_WIDTH}px) / ${products.length})`
      : 'auto';

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        overflow: 'hidden',
        bgcolor: theme => theme.landingPage.background,
        py: 2,
        px: 2,
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          width: '100%',
          overflowX: 'auto',
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 900,
            tableLayout: 'fixed',
            width: '100%',
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: FIRST_COL_WIDTH,
                  position: 'sticky',
                  left: 0,
                  zIndex: 3,
                  bgcolor: theme.palette.background.paper,
                  borderRight: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Pricing Table
                </Typography>
              </TableCell>
              {products.map((product, index) => {
                const color = columnColors[index % columnColors.length];
                const palette = theme.palette[color];
                return (
                  <TableCell
                    key={product.id}
                    align="center"
                    sx={{
                      p: 0,
                      height: HEADER_CELL_HEIGHT,
                      width: productColumnWidth,
                      borderLeft: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box
                      sx={{
                        p: 0,
                        bgcolor: palette.main,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box
                        sx={{
                          fontWeight: 600,
                          flex: '1 1 auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            lineHeight: 1.2,
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            overflow: 'hidden',
                            fontSize: '1.1rem',
                            color: theme => theme.palette.common.white,
                          }}
                        >
                          {product.product_name}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          px: 2,
                          py: 1.75,
                          flex: '0 0 auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme => theme.palette.common.white,
                        }}
                      >
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>
                          {(() => {
                            const price = getDisplayPrice(product);
                            return `${price.symbol}${price.amount.toFixed(2)}`;
                          })()}
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
                  height: FEATURE_ROW_HEIGHT,
                  '&:nth-of-type(odd)': {
                    bgcolor: theme.palette.action.hover,
                  },
                }}
              >
                <TableCell
                  sx={{
                    height: FEATURE_ROW_HEIGHT,
                    position: 'sticky',
                    left: 0,
                    zIndex: 2,
                    bgcolor: 'inherit',
                    borderRight: `1px solid ${theme.palette.divider}`,
                    width: FIRST_COL_WIDTH,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {title}
                  </Typography>
                </TableCell>
                {products.map(product => (
                  <TableCell
                    key={product.id}
                    align="center"
                    sx={{
                      height: FEATURE_ROW_HEIGHT,
                      width: productColumnWidth,
                      borderLeft: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {(() => {
                      const value = getValueForTitle(product, title) || '-';
                      const pill = yesNoPill(value);
                      if (pill) return pill;

                      return (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {value}
                        </Typography>
                      );
                    })()}
                  </TableCell>
                ))}
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
                  width: FIRST_COL_WIDTH,
                }}
              />
              {products.map((product, index) => {
                const color = columnColors[index % columnColors.length];
                return (
                  <TableCell
                    key={product.id}
                    align="center"
                    sx={{ width: productColumnWidth }}
                  >
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleBuy(product)}
                      sx={theme => ({
                        py: 1.25,
                        fontWeight: 800,
                        borderRadius: 999,
                        backgroundColor: theme.palette[color].main,
                        color: theme.palette.common.white,
                        boxShadow: 'none',
                        '&:hover': {
                          backgroundColor:
                            theme.palette[color].dark ||
                            theme.palette[color].main,
                          boxShadow: 'none',
                        },
                      })}
                    >
                      BUY NOW
                    </Button>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default PricingComparision;
