import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/GridLegacy';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import LandingPageTypography from './LandingPageTypography';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../router/router';

const item: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  px: 5,
};

const number: SxProps<Theme> = {
  fontSize: 28,
  fontFamily: 'default',
  color: 'secondary.main',
  fontWeight: 'medium',
};

export default function CognitiveJourney() {
  const navigate = useNavigate();

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        bgcolor: theme => theme.landingPage.background,
        overflow: 'hidden',
      }}
    >
      <Container
        sx={{
          mt: 10,
          mb: 10,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <LandingPageTypography
          variant="h4"
          component="h2"
          align="center"
          sx={{ mb: 6 }}
        >
          Your Cognitive Journey in 3 Simple Steps
        </LandingPageTypography>

        <Grid container spacing={5}>
          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              sx={theme => ({
                height: '100%',
                borderRadius: 3,
                borderColor: alpha(theme.palette.divider, 0.5),
                backgroundColor: alpha(theme.palette.background.paper, 0.55),
                backdropFilter: 'blur(14px) saturate(180%)',
                WebkitBackdropFilter: 'blur(14px) saturate(180%)',
                transition: theme.transitions.create(
                  ['transform', 'box-shadow', 'border-color'],
                  {
                    duration: theme.transitions.duration.short,
                  }
                ),
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[2],
                  borderColor: alpha(theme.palette.text.secondary, 0.6),
                },
              })}
            >
              <Box sx={{ ...item, py: 4 }}>
                <Box sx={number}>1️⃣</Box>
                <LandingPageTypography
                  variant="h6"
                  align="center"
                  sx={{ mt: 1.5, fontWeight: 700, lineHeight: 1.3 }}
                >
                  Take the DMAC™ Online Cognitive Test
                </LandingPageTypography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              sx={theme => ({
                height: '100%',
                borderRadius: 3,
                borderColor: alpha(theme.palette.divider, 0.5),
                backgroundColor: alpha(theme.palette.background.paper, 0.55),
                backdropFilter: 'blur(14px) saturate(180%)',
                WebkitBackdropFilter: 'blur(14px) saturate(180%)',
                transition: theme.transitions.create(
                  ['transform', 'box-shadow', 'border-color'],
                  {
                    duration: theme.transitions.duration.short,
                  }
                ),
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[2],
                  borderColor: alpha(theme.palette.text.secondary, 0.6),
                },
              })}
            >
              <Box sx={{ ...item, py: 4 }}>
                <Box sx={number}>2️⃣</Box>
                <LandingPageTypography
                  variant="h6"
                  align="center"
                  sx={{ mt: 1.5, fontWeight: 700, lineHeight: 1.3 }}
                >
                  Review Results with Expert Guidance
                </LandingPageTypography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              sx={theme => ({
                height: '100%',
                borderRadius: 3,
                borderColor: alpha(theme.palette.divider, 0.5),
                backgroundColor: alpha(theme.palette.background.paper, 0.55),
                backdropFilter: 'blur(14px) saturate(180%)',
                WebkitBackdropFilter: 'blur(14px) saturate(180%)',
                transition: theme.transitions.create(
                  ['transform', 'box-shadow', 'border-color'],
                  {
                    duration: theme.transitions.duration.short,
                  }
                ),
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[2],
                  borderColor: alpha(theme.palette.text.secondary, 0.6),
                },
              })}
            >
              <Box sx={{ ...item, py: 4 }}>
                <Box sx={number}>3️⃣</Box>
                <LandingPageTypography
                  variant="h6"
                  align="center"
                  sx={{ mt: 1.5, fontWeight: 700, lineHeight: 1.3 }}
                >
                  Upgrade to Personalized Brain Training with LICCA™ (Optional)
                </LandingPageTypography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 5,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button
            variant="contained"
            onClick={() => navigate(ROUTES.PRODUCTS_LISTING)}
          >
            Explore Products
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
