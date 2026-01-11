import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import LandingPageToolbar from './LandingPageToolbar';
import LandingPageAppBar from './LandingPageAppBar';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../../../router/router';

function AppAppBar() {
  const navigate = useNavigate();

  const handleNavigateToPatientLogin = () => {
    navigate(ROUTES.PATIENT_LOGIN);
  };

  const handleNavigateToProducts = () => {
    navigate('/products');
  };

  return (
    <div>
      <LandingPageAppBar
        position="fixed"
        sx={{
          backgroundColor: theme => theme.landingPage.darkBg,
        }}
      >
        <LandingPageToolbar sx={{ justifyContent: 'space-between' }}>
          <Link
            variant="h6"
            underline="none"
            color="inherit"
            component={RouterLink}
            to={ROUTES.HOME}
            sx={{ fontSize: 24 }}
          >
            {'RM360 Global'}
          </Link>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleNavigateToProducts}
              sx={{ mr: 1, color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.08)' } }}
            >
              Explore Product
            </Button>
            <Button
              variant="contained"
              onClick={handleNavigateToPatientLogin}
            >
              Login
            </Button>
          </Box>
        </LandingPageToolbar>
      </LandingPageAppBar>
      <LandingPageToolbar />
    </div>
  );
}

export default AppAppBar;
