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

function ProductValues() {
  return (
    <Box
      component="section"
      sx={{ display: 'flex', overflow: 'hidden', bgcolor: 'secondary.light' }}
    >
      <Container sx={{ mt: 15, mb: 30, display: 'flex', position: 'relative' }}>
        <Box
          component="img"
          src="/static/themes/onepirate/productCurvyLines.png"
          alt="curvy lines"
          sx={{ pointerEvents: 'none', position: 'absolute', top: -180 }}
        />
        <Grid container spacing={5}>
          <Grid item xs={12} md={4}>
            <Box sx={item}>
              <Box
                component="img"
                src="/static/themes/onepirate/productValues1.svg"
                alt="suitcase"
                sx={{ height: 55 }}
              />
              <LandingPageTypography variant="h6" sx={{ my: 5 }}>
                The best luxury hotels
              </LandingPageTypography>
              <LandingPageTypography variant="h5">
                {
                  'From the latest trendy boutique hotel to the iconic palace with XXL pool'
                }
                {
                  ', go for a mini-vacation just a few subway stops away from your home.'
                }
              </LandingPageTypography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={item}>
              <Box
                component="img"
                src="/static/themes/onepirate/productValues2.svg"
                alt="graph"
                sx={{ height: 55 }}
              />
              <LandingPageTypography variant="h6" sx={{ my: 5 }}>
                New experiences
              </LandingPageTypography>
              <LandingPageTypography variant="h5">
                {
                  'Privatize a pool, take a Japanese bath or wake up in 900m2 of garden… '
                }
                {'your Sundays will not be alike.'}
              </LandingPageTypography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={item}>
              <Box
                component="img"
                src="/static/themes/onepirate/productValues3.svg"
                alt="clock"
                sx={{ height: 55 }}
              />
              <LandingPageTypography variant="h6" sx={{ my: 5 }}>
                Exclusive rates
              </LandingPageTypography>
              <LandingPageTypography variant="h5">
                {'By registering, you will access specially negotiated rates '}
                {'that you will not find anywhere else.'}
              </LandingPageTypography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ProductValues;
