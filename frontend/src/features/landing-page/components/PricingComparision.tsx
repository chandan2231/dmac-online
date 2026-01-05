import CustomLoader from '../../../components/loader';
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useGetProductListing } from '../../admin/hooks/useGetProductListing';
import { get } from 'lodash';
import type { IProduct, IProductFeature } from '../../admin/admin.interface';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../router/router';

function PricingComparision() {
  const { data, isLoading, error } = useGetProductListing();
  const navigate = useNavigate();

  if (isLoading) {
    return <CustomLoader />;
  }

  if (error) {
    return null;
  }

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
      if (!seenTitles.has(title)) {
        seenTitles.add(title);
        orderedTitles.push(title);
      }
    }
  }

  const getValueForTitle = (product: IProduct, title: string) => {
    const match = (product.feature ?? []).find(
      item => (item?.title ?? '').trim() === title
    );
    return (match?.value ?? '').toString();
  };

  const handleBuy = (product: IProduct) => {
    navigate(ROUTES.PATIENT_REGISTRATION, { state: { ...product } });
  };

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        overflow: 'hidden',
        bgcolor: theme => theme.landingPage.background,
      }}
    >
      <Container sx={{ mt: 8, mb: 30, display: 'flex', position: 'relative' }}>
        <Box sx={{ width: '100%' }}>
          <TableContainer
            component={Paper}
            sx={{ width: '100%', overflowX: 'auto' }}
          >
            <Table size="small" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 260 }}>
                    <Typography variant="h6">Pricing</Typography>
                  </TableCell>
                  {products.map(product => (
                    <TableCell key={product.id} align="center">
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {product.product_name}
                      </Typography>
                      <Typography variant="body2">
                        ${Number(product.product_amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {orderedTitles.map(title => (
                  <TableRow key={title}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {title}
                      </Typography>
                    </TableCell>
                    {products.map(product => (
                      <TableCell key={product.id} align="center">
                        <Typography variant="body2">
                          {getValueForTitle(product, title) || '-'}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

                <TableRow>
                  <TableCell />
                  {products.map(product => (
                    <TableCell key={product.id} align="center">
                      <Button
                        variant="contained"
                        onClick={() => handleBuy(product)}
                      >
                        Buy
                      </Button>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </Box>
  );
}

export default PricingComparision;
