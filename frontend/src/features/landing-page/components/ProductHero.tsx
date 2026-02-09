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
      {/* <img
        style={{ display: 'none' }}
        src={backgroundImage}
        alt="increase priority"
      /> */}
      <LandingPageTypography
        color="inherit"
        align="center"
        variant="h2"
        marked="center"
        sx={{ color: 'common.white' }}
      >
        Understand Your Cognitive Health—Online
      </LandingPageTypography>
      <LandingPageTypography
        color="inherit"
        align="center"
        variant="h5"
        sx={{ mb: 4, mt: { xs: 4, sm: 10 }, color: 'common.white' }}
      >
        RM360™ combines DMAC™ comprehensive online cognitive testing, expert
        clinical guidance, and personalized brain training with LICCA™—all
        accessible from home.
      </LandingPageTypography>

      <LandingPageTypography variant="body2" color="inherit" sx={{ mt: 2 }}>
        Discover the experience
      </LandingPageTypography>
    </ProductHeroLayout>
  );
}
