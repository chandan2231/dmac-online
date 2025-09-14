import Box from '@mui/material/Box';
import Grid from '@mui/material/GridLegacy';
import Container from '@mui/material/Container';
import LandingPageTypography from './LandingPageTypography';
import type { Theme } from '@emotion/react';
import type { SxProps } from '@mui/material';

const item: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  px: 5,
};

interface IProductCard {
  title: string;
  description: string;
  image: string;
}

const PRODUCT_LIST: IProductCard[] = [
  {
    title: 'The best luxury hotels',
    description:
      'From the latest trendy boutique hotel to the iconic palace with XXL pool, go for a mini-vacation just a few subway stops away from your home.',
    image: '/onepirate/productValues1.svg',
  },
  {
    title: 'New experiences',
    description:
      'Privatize a pool, take a Japanese bath or wake up in 900m2 of garden… your Sundays will not be alike.',
    image: '/onepirate/productValues2.svg',
  },
  {
    title: 'Exclusive rates',
    description:
      'By registering, you will access specially negotiated rates that you will not find anywhere else.',
    image: '/onepirate/productValues3.svg',
  },
];

const ProductCard = ({ title, description, image }: IProductCard) => (
  <Box sx={item}>
    <Box component="img" src={image} alt={title} sx={{ height: 55 }} />
    <LandingPageTypography variant="h6" sx={{ my: 5 }}>
      {title}
    </LandingPageTypography>
    <LandingPageTypography variant="h5">{description}</LandingPageTypography>
  </Box>
);

function ProductValues() {
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
        <Grid container spacing={5}>
          {PRODUCT_LIST.map(product => (
            <Grid item xs={12} md={4} key={product.title}>
              <ProductCard {...product} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default ProductValues;
