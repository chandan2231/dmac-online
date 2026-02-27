import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import LandingPageToolbar from './LandingPageToolbar';
import LandingPageAppBar from './LandingPageAppBar';
import { Button, IconButton, Menu, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../../../router/router';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

function AppAppBar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleNavigateToPatientLogin = () => {
    navigate(ROUTES.PATIENT_LOGIN);
  };

  const handleNavigateToProducts = () => {
    navigate(ROUTES.PRODUCTS_LISTING);
  };

  const handleNavigateToAthleteCenter = () => {
    navigate(ROUTES.ATHLETE_CENTER);
  };

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  return (
    <div>
      <LandingPageAppBar
        position="fixed"
        sx={{
          backgroundColor: theme => theme.landingPage.darkBg,
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <LandingPageToolbar
          sx={{
            justifyContent: 'space-between',
            px: { xs: 1.25, sm: 2 },
            minHeight: { xs: 56, sm: 64 },
          }}
        >
          <Link
            variant="h6"
            underline="none"
            color="inherit"
            component={RouterLink}
            to={ROUTES.HOME}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: 18, sm: 22 },
              fontWeight: 800,
              letterSpacing: 0.2,
              whiteSpace: 'nowrap',
            }}
          >
            <img
              src="/RM360-LOGO.png"
              alt="RM360 Logo"
              style={{ height: isMobile ? 30 : 40, width: 'auto', marginRight: 8 }}
            />
            <span>RM360</span>
          </Link>

          {isMobile ? (
            <>
              <IconButton
                aria-label="open menu"
                onClick={handleOpenMenu}
                sx={{
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 2,
                }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={isMenuOpen}
                onClose={handleCloseMenu}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 190,
                    bgcolor: theme => theme.landingPage.darkBg,
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.12)',
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    handleNavigateToAthleteCenter();
                  }}
                  sx={{ fontSize: 16, fontWeight: 600 }}
                >
                  Athlete Center
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    handleNavigateToProducts();
                  }}
                  sx={{ fontSize: 16, fontWeight: 600 }}
                >
                  Explore Product
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    handleNavigateToPatientLogin();
                  }}
                  sx={{ fontSize: 16, fontWeight: 600 }}
                >
                  Login
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleNavigateToProducts}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.75)',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 999,
                  px: 2.5,
                  py: 0.9,
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.10)',
                  },
                }}
              >
                Explore Product
              </Button>
              <Button
                variant="outlined"
                onClick={handleNavigateToAthleteCenter}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.75)',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 999,
                  px: 2.5,
                  py: 0.9,
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.10)',
                  },
                }}
              >
                Athlete Center
              </Button>
              <Button
                variant="contained"
                onClick={handleNavigateToPatientLogin}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: 999,
                  px: 2.75,
                  py: 0.9,
                  whiteSpace: 'nowrap',
                }}
              >
                Login
              </Button>
            </Box>
          )}
        </LandingPageToolbar>
      </LandingPageAppBar>
      <LandingPageToolbar />
    </div>
  );
}

export default AppAppBar;
