import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/GridLegacy';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import { Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';

function Copyright() {
  return (
    <React.Fragment>
      {'© '}
      <Link color="inherit" href="https://mui.com/">
        RM360 Global
      </Link>{' '}
      {new Date().getFullYear()}
    </React.Fragment>
  );
}

const iconStyle = (theme: Theme) => ({
  width: 48,
  height: 48,
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
      }}
    >
      <Container sx={{ my: 8, display: 'flex' }}>
        <Grid container spacing={5}>
          <Grid item xs={6} sm={4} md={3}>
            <Grid
              container
              direction="column"
              spacing={2}
              sx={{ justifyContent: 'flex-end', height: 120 }}
            >
              <Grid item sx={{ display: 'flex' }}>
                <Box component="a" href="https://mui.com/" sx={iconStyle}>
                  <img src="/onepirate/appFooterFacebook.png" alt="Facebook" />
                </Box>
                <Box component="a" href="https://x.com/MUI_hq" sx={iconStyle}>
                  <img src="/onepirate/appFooterTwitter.png" alt="X" />
                </Box>
              </Grid>
              <Grid item>
                <Copyright />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h6" gutterBottom>
              Legal
            </Typography>
            <Box component="ul" sx={{ m: 0, listStyle: 'none', p: 0 }}>
              <Box component="li" sx={{ py: 0.5 }}>
                <Link href="/premium-themes/onepirate/terms/">Terms</Link>
              </Box>
              <Box component="li" sx={{ py: 0.5 }}>
                <Link href="/premium-themes/onepirate/privacy/">Privacy</Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Typography>
  );
}
