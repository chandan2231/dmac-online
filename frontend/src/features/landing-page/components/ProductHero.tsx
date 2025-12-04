import LandingPageTypography from './LandingPageTypography';
import ProductHeroLayout from './ProductHeroLayout';

const backgroundImage = '/onepirate/memory-loss.jpg';

export default function ProductHero() {
  return (
    <ProductHeroLayout
      sxBackground={theme => ({
        backgroundImage: `url(${backgroundImage})`,
        backgroundColor: theme.landingPage.secondary, // Average color of the background image.
        backgroundPosition: 'center',
      })}
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
        sx={{ color: 'common.white' }}
      >
        Solution to Memory Loss
      </LandingPageTypography>
      <LandingPageTypography
        color="inherit"
        align="center"
        variant="h5"
        sx={{ mb: 4, mt: { xs: 4, sm: 10 }, color: 'common.white' }}
      >
        Regain Memory 360 (RM360) is a research-backed brain workout for memory
        loss and cognitive decline.
      </LandingPageTypography>

      <LandingPageTypography variant="body2" color="inherit" sx={{ mt: 2 }}>
        Discover the experience
      </LandingPageTypography>
    </ProductHeroLayout>
  );
}
