import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  // useTheme,
  // useMediaQuery,
  Box,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import { useSidebarContext } from '../sidebar/provider';
// import { canWeShowChangeLanguageOption } from '../../utils/functions';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { get } from 'lodash';
import MenuIcon from '@mui/icons-material/Menu';
import withAuthGuard from '../../middlewares/withAuthGuard';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MoreVertIcon from '@mui/icons-material/MoreVert';
// import ColorMode from '../../providers/theme-provider/ColorMode';
import LogoutFeature from '../../features/auth/components/logout';
// import LanguageMode from '../../i18n/LanguageMode';
import type { IUser } from '../../features/auth/auth.interface';
import GoogleTranslateWidget from '../../i18n/GoogleTranslateWidget';

const navItems: string[] = [];

const getTextByRole = (role: IUser['role']) => {
  switch (role) {
    case 'ADMIN':
      return 'Admin Dashboard';
    case 'SUPER_ADMIN':
      return 'Admin Dashboard';
    case 'EXPERT':
      return 'Expert Dashboard';
    case 'USER':
      return 'User Dashboard';
    case 'THERAPIST':
      return 'Therapist Dashboard';
    default:
      return 'Dashboard';
  }
};

const Header = () => {
  // const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showDrawer, drawerOpen, toggleDrawer } = useSidebarContext();
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isMobile = false;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Box
          sx={{
            flexGrow: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            onClick={() => toggleDrawer()}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            {showDrawer ? (
              <>{drawerOpen ? <MenuOpenIcon /> : <MenuIcon />}</>
            ) : null}
          </Box>
          <Box>
            <Typography variant="h6">DMAC</Typography>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {getTextByRole(get(user, 'role') as IUser['role'])}
        </Typography>

        {/* Mobile */}
        {isMobile && navItems.length > 0 ? (
          <>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {navItems.length > 0 &&
                navItems.map(item => (
                  <MenuItem key={item} onClick={handleMenuClose}>
                    {item}
                  </MenuItem>
                ))}
            </Menu>
          </>
        ) : null}

        {/*  Desktop */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {navItems.length > 0 &&
              navItems.map(item => (
                <Button key={item} color="inherit">
                  {item}
                </Button>
              ))}
            <GoogleTranslateWidget />
            {/* {canWeShowChangeLanguageOption(user) && <LanguageMode />} */}
            {/* <ColorMode /> */}
            <LogoutFeature />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

const HeaderWithAuth = withAuthGuard(Header);

export default HeaderWithAuth;
