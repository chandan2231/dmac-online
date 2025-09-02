import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import LandingPageToolbar from './LandingPageToolbar';
import LandingPageAppBar from './LandingPageAppBar';
import { ROUTES } from '../../auth/auth.interface';

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
          <Link
            variant="h6"
            underline="none"
            color="inherit"
            href={ROUTES.HOME}
            sx={{ fontSize: 24 }}
          >
            {'DMAC'}
          </Link>
          <Box
            sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}
          ></Box>
        </LandingPageToolbar>
      </LandingPageAppBar>
      <LandingPageToolbar />
    </div>
  );
}

export default AppAppBar;
