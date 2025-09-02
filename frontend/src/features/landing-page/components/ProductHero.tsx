import LandingPageTypography from './LandingPageTypography';
import ProductHeroLayout from './ProductHeroLayout';

const backgroundImage =
  'https://images.unsplash.com/photo-1534854638093-bada1813ca19?auto=format&fit=crop&w=1400';

export default function ProductHero() {
  return (
    <ProductHeroLayout
      sxBackground={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundColor: '#7fc7d9', // Average color of the background image.
        backgroundPosition: 'center',
      }}
    >
      {/* Increase the network loading priority of the background image. */}
      <img
        style={{ display: 'none' }}
        src={backgroundImage}
        alt="increase priority"
      />
      <LandingPageTypography
        color="inherit"
        align="center"
        variant="h2"
        marked="center"
      >
        Upgrade your Sundays
      </LandingPageTypography>
      <LandingPageTypography
        color="inherit"
        align="center"
        variant="h5"
        sx={{ mb: 4, mt: { xs: 4, sm: 10 } }}
      >
        Enjoy secret offers up to -70% off the best luxury hotels every Sunday.
      </LandingPageTypography>

      <LandingPageTypography variant="body2" color="inherit" sx={{ mt: 2 }}>
        Discover the experience
      </LandingPageTypography>
    </ProductHeroLayout>
  );
}
