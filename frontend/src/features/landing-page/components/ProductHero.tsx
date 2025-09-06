import LandingPageTypography from './LandingPageTypography';
import ProductHeroLayout from './ProductHeroLayout';
 

const backgroundImage = '/onepirate/memory-loss.jpg'
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
        sx={{color: '#ffffff'}}
      >
        Solution to Memory Loss
      </LandingPageTypography>
      <LandingPageTypography
        color="inherit"
        align="center"
        variant="h5"
        sx={{ mb: 4, mt: { xs: 4, sm: 10 }, color: '#ffffff' }}
      >
        Regain Memory 360 (RM360) is a research-backed brain workout for memory loss and cognitive decline.
      </LandingPageTypography>

      <LandingPageTypography variant="body2" color="inherit" sx={{ mt: 2 }}>
        Discover the experience
      </LandingPageTypography>
    </ProductHeroLayout>
  );
}
