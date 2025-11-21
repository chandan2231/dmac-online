import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import LandingPageTypography from './LandingPageTypography';
import type { Theme } from '@emotion/react';
import { type SxProps } from '@mui/material';
import CustomLoader from '../../../components/loader';
import { useGetProductListing } from '../../admin/hooks/useGetProductListing';
import { get } from 'lodash';
import type { IProduct } from '../../admin/admin.interface';

const item: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  px: 5,
  py: 5,
  minHeight: 300,
  borderRadius: 2,
  bgcolor: 'white',
  boxShadow: 3,
  textAlign: 'center',
  cursor: 'pointer',
  flex: '1 1 100%',

  // Hover effect
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: 6,
  },
};

const PRODUCT_LIST_IMAGE = [
  '/onepirate/productValues1.svg',
  '/onepirate/productValues2.svg',
  '/onepirate/productValues3.svg',
];

const ProductCard = ({ index, ...args }: IProduct & { index: number }) => {
  const { product_name, product_description } = args;
  return (
    <Box sx={item}>
      <Box
        component="img"
        src={
          typeof get(PRODUCT_LIST_IMAGE, index) === 'string'
            ? get(PRODUCT_LIST_IMAGE, index)
            : '/onepirate/productValues1.svg'
        }
        alt={product_name}
        sx={{ height: 55 }}
      />
      <LandingPageTypography variant="subtitle1" sx={{ my: 3 }}>
        {product_name}
      </LandingPageTypography>
      <LandingPageTypography variant="subtitle2">
        {product_description}
      </LandingPageTypography>
    </Box>
  );
};

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
      sx={{ display: 'flex', overflow: 'hidden', bgcolor: '#fff5f8' }}
    >
      <Container sx={{ mt: 15, mb: 30, display: 'flex', position: 'relative' }}>
        <Box
          component="img"
          src="/onepirate/productCurvyLines.png"
          alt="curvy lines"
          sx={{ pointerEvents: 'none', position: 'absolute', top: -180 }}
        />

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
                <ProductCard index={index} {...product} />
              </Box>
            )
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default ProductValues;
