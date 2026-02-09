import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CustomLoader from '../../../components/loader';
import { useGetProductListing } from '../../admin/hooks/useGetProductListing';
import { get } from 'lodash';
import type { IProduct } from '../../admin/admin.interface';
import ProductCard from './ProductCard';

function ProductValues() {
  const { data, isLoading, error } = useGetProductListing();

  if (isLoading) {
    return <CustomLoader />;
  }

  if (error) {
    return null;
  }

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
        {/* Flex container instead of Grid */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 5, // replaces Grid spacing
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {((get(data, 'data', []) as IProduct[]) ?? []).map(
            (product: IProduct, index: number) => (
              <Box
                key={index}
                sx={{
                  flex: {
                    xs: '1 1 100%', // full width on small
                    md: '1 1 calc(33.333% - 40px)', // 3 per row on md+
                  },
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <ProductCard {...product} />
              </Box>
            )
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default ProductValues;
