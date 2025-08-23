import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import LandingPageToolbar from './LandingPageToolbar';
import LandingPageAppBar from './LandingPageAppBar';
import { ROUTES } from '../../auth/auth.interface';

const rightLink = {
  fontSize: 16,
  color: 'common.white',
  ml: 3,
};

function AppAppBar() {
  return (
    <div>
      <LandingPageAppBar
        position="fixed"
        sx={{
          backgroundColor: '#28282a',
        }}
      >
        <LandingPageToolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }} />
          <Link
            variant="h6"
            underline="none"
            color="inherit"
            href={ROUTES.HOME}
            sx={{ fontSize: 24 }}
          >
            {'DMAC'}
          </Link>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Link
              color="inherit"
              variant="h6"
              underline="none"
              href={ROUTES.LOGIN}
              sx={rightLink}
            >
              {'Sign In'}
            </Link>
            <Link
              variant="h6"
              underline="none"
              href={ROUTES.REGISTER}
              sx={{ ...rightLink, color: 'secondary.main' }}
            >
              {'Sign Up'}
            </Link>
          </Box>
        </LandingPageToolbar>
      </LandingPageAppBar>
      <LandingPageToolbar />
    </div>
  );
}

export default AppAppBar;
