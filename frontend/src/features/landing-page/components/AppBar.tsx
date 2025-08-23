import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import MuiToolbar from '@mui/material/Toolbar';
import MuiAppBar, { type AppBarProps } from '@mui/material/AppBar';
import { ROUTES } from '../../auth/auth.interface';
import { styled } from '@mui/material/styles';

function AppBar(props: AppBarProps) {
  return <MuiAppBar elevation={0} position="fixed" {...props} />;
}

const Toolbar = styled(MuiToolbar)(({ theme }) => ({
  height: 64,
  [theme.breakpoints.up('sm')]: {
    height: 70,
  },
}));

const rightLink = {
  fontSize: 16,
  color: 'common.white',
  ml: 3,
};

function AppAppBar() {
  return (
    <div>
      <AppBar position="fixed">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
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
        </Toolbar>
      </AppBar>
      <Toolbar />
    </div>
  );
}

export default AppAppBar;
