import React from 'react';
import AppAppBar from './components/AppBar';
import ProductHero from './components/ProductHero';
import ProductValues from './components/ProductValues';
// import ProductCategories from './components/ProductCategories';
import ProductHowItWorks from './components/ProductHowItWorks';
// import ProductCTA from './components/ProductCTA';
// import ProductSmokingHero from './components/ProductSmokingHero';
import AppFooter from './components/AppFooter';
import { Box } from '@mui/material';

const LandingPage = () => {
  return (
    <React.Fragment>
      <AppAppBar />
      <ProductHero />
      <Box sx={{ bgcolor: 'background.default' }}>
        <ProductValues />
        {/* <ProductCategories /> */}
        <ProductHowItWorks />
        {/* <ProductCTA /> */}
        {/* <ProductSmokingHero /> */}
        <AppFooter />
      </Box>
    </React.Fragment>
  );
};

export default LandingPage;
