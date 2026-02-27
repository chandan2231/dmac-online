import React from 'react';
import AppAppBar from '../../features/landing-page/components/AppBar';
// import ProductHero from '../../features/landing-page/components/ProductHero';
import ProductHeroLayout from '../../features/landing-page/components/ProductHeroLayout';
import { Box, Container, Typography } from '@mui/material';
import LandingPageTypography from '../../features/landing-page/components/LandingPageTypography';
import AppFooter from '../../features/landing-page/components/AppFooter';

const AthleteCenterPage = () => {
  return (
    <React.Fragment>
      <AppAppBar />
      <ProductHeroLayout
        sxBackground={theme => ({
          backgroundImage: `url(/onepirate/athelet-banner.png)`,
          backgroundColor: theme.landingPage.secondary,
          backgroundPosition: 'center',
        })}
      />
      
        <Box
          component="section"
          sx={{ display: 'flex', overflow: 'hidden', bgcolor: theme => theme.landingPage.background }}
        >
          <Container sx={{ mt: 10, mb: 10 }}>
            <LandingPageTypography variant="h4" component="h2" sx={{ fontWeight: 800, mb: 2 }}>
              RM360 – Cognitive Screening Athletes Repository Program (C-SARP)
            </LandingPageTypography>

            <LandingPageTypography variant="h5" sx={{ mt: 3, fontWeight: 700 }}>
              Program Overview
            </LandingPageTypography>
            <LandingPageTypography variant="body2" sx={{ color: 'text.secondary', mt: 1.5, lineHeight: 1.7 }}>
              The RM360 Cognitive Screening Athletes Repository Program (C-SARP) is a voluntary, non-diagnostic cognitive screening and education program designed to support student-athlete safety and concussion awareness. The program establishes pre-season baseline cognitive data using a 12-domain digital cognitive screening that athletes can complete at home. Baseline results are securely stored and may be used for future comparison following a suspected concussion or head injury, in support of medical evaluation.
            </LandingPageTypography>

            <LandingPageTypography variant="h5" sx={{ mt: 3, fontWeight: 700 }}>
              Purpose & Educational Value
            </LandingPageTypography>
            <LandingPageTypography variant="body2" sx={{ color: 'text.secondary', mt: 1.5, lineHeight: 1.7 }}>
              C-SARP is intended to:
            </LandingPageTypography>
            <Box component="ul" sx={{ pl: 3, mt: 1 }}>
              <li>
                <LandingPageTypography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  Promote early awareness of cognitive changes
                </LandingPageTypography>
              </li>
              <li>
                <LandingPageTypography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  Support safe return-to-play discussions
                </LandingPageTypography>
              </li>
              <li>
                <LandingPageTypography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  Enhance brain-health education for athletes and families
                </LandingPageTypography>
              </li>
              <li>
                <LandingPageTypography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  Provide objective baseline information to assist licensed healthcare professionals
                </LandingPageTypography>
              </li>
            </Box>
            <LandingPageTypography variant="body2" sx={{ color: 'text.secondary', mt: 2, lineHeight: 1.7 }}>
              The program supplements existing concussion protocols and does not replace medical care.
            </LandingPageTypography>

            <LandingPageTypography variant="h5" sx={{ mt: 3, fontWeight: 700 }}>
              Legal & Regulatory Alignment (Texas)
            </LandingPageTypography>
            <LandingPageTypography variant="body2" sx={{ color: 'text.secondary', mt: 1.5, lineHeight: 1.7 }}>
              C-SARP aligns with Texas Education Code Chapter 38, Subchapter D and UIL concussion management requirements, including recognition that concussions are medical conditions; requirement that return-to-play decisions are made by licensed healthcare professionals; and emphasis on education, monitoring, and athlete safety. C-SARP does not diagnose concussion, traumatic brain injury, or cognitive impairment, and it does not authorize return-to-play decisions.
            </LandingPageTypography>

            <LandingPageTypography variant="h5" sx={{ mt: 3, fontWeight: 700 }}>
              Benefits to the District
            </LandingPageTypography>
            <Box component="ul" sx={{ pl: 3, mt: 1 }}>
              <li>
                <LandingPageTypography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  Strengthens student-athlete safety initiatives
                </LandingPageTypography>
              </li>
              <li>
                <LandingPageTypography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  Demonstrates proactive risk management
                </LandingPageTypography>
              </li>
              <li>
                <LandingPageTypography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  Supports compliance with state concussion laws
                </LandingPageTypography>
              </li>
              <li>
                <LandingPageTypography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  Minimal administrative burden (home-based screening)
                </LandingPageTypography>
              </li>
              <li>
                <LandingPageTypography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  Promotes a brain-health-first athletic culture
                </LandingPageTypography>
              </li>
            </Box>
          </Container>
        </Box>
      <AppFooter />
    </React.Fragment>
  );
};

export default AthleteCenterPage;
