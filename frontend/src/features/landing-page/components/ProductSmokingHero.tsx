import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import LandingPageButton from './LandingPageButton';
import LandingPageTypography from './LandingPageTypography';

function ProductSmokingHero() {
  return (
    <Container
      component="section"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        my: 9,
      }}
    >
      <LandingPageButton
        sx={{
          border: '4px solid currentColor',
          borderRadius: 0,
          height: 'auto',
          py: 2,
          px: 5,
        }}
      >
        <LandingPageTypography variant="h4" component="span">
          Got any questions? Need help?
        </LandingPageTypography>
      </LandingPageButton>
      <LandingPageTypography variant="subtitle1" sx={{ my: 3 }}>
        We are here to help. Get in touch!
      </LandingPageTypography>
      <Box
        component="img"
        src="/onepirate/productBuoy.svg"
        alt="buoy"
        sx={{ width: 60 }}
      />
    </Container>
  );
}

export default ProductSmokingHero;
