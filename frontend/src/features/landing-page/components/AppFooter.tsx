import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/GridLegacy';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import { Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { ROUTES } from '../../../router/router';

function Copyright() {
  return (
    <React.Fragment>
      {'© '}
      <Link component={RouterLink} to="/" color="inherit">
        RM360
      </Link>{' '}
      {new Date().getFullYear()}
    </React.Fragment>
  );
}

const iconStyle = (theme: Theme) => ({
  width: 36,
  height: 36,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.landingPage.primary,
  mr: 1,
  '&:hover': {
    bgcolor: theme.landingPage.tertiary,
  },
});

export default function AppFooter() {
  return (
    <Typography
      component="footer"
      sx={{
        display: 'flex',
        bgcolor: theme => theme.landingPage.background,
        width: '100%',
        height: 120,
        maxHeight: 120,
        overflow: 'hidden',
      }}
    >
      <Container
        sx={{
          py: 2,
          display: 'flex',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6} sm={4} md={3}>
            <Grid
              container
              direction="column"
              spacing={1}
              sx={{ justifyContent: 'center', height: '100%' }}
            >
              <Grid item sx={{ display: 'flex' }}>
                <Box component="a" href="#" sx={iconStyle}>
                  <img src="/onepirate/appFooterFacebook.png" alt="Facebook" />
                </Box>
                <Box component="a" href="#" sx={iconStyle}>
                  <img src="/onepirate/appFooterTwitter.png" alt="X" />
                </Box>
              </Grid>
              <Grid item>
                <Typography variant="body2" color="text.secondary">
                  <Copyright />
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Legal
            </Typography>
            <Box component="ul" sx={{ m: 0, listStyle: 'none', p: 0 }}>
              <Box component="li" sx={{ py: 0.25, lineHeight: 1.2 }}>
                <Link component={RouterLink} to={ROUTES.TERMS_OF_SERVICE}>
                  Terms
                </Link>
              </Box>
              <Box component="li" sx={{ py: 0.25, lineHeight: 1.2 }}>
                <Link component={RouterLink} to={ROUTES.PRIVACY_POLICY}>
                  Privacy
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Typography>
  );
}
