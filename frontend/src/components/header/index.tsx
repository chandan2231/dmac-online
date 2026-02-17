import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Box,
  Menu,
  MenuItem,
  Button,
  Avatar,
  Stack,
  ButtonBase,
  Divider,
  ListItemIcon,
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
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
// import ColorMode from '../../providers/theme-provider/ColorMode';
import LogoutFeature from '../../features/auth/components/logout';
// import LanguageMode from '../../i18n/LanguageMode';
import type { IUser } from '../../features/auth/auth.interface';
import GoogleTranslateWidget from '../../i18n/GoogleTranslateWidget';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../router/router';

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
    case 'COUNTRY_ADMIN':
      return 'Country Admin Dashboard';
    default:
      return 'Dashboard';
  }
};

const getInitials = (fullName: string) => {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const Header = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const { showDrawer, drawerOpen, toggleDrawer } = useSidebarContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const fullName = String(get(user, 'name') || '').trim();
  const fallbackName = String(get(user, 'email') || 'Account');
  const displayName = fullName || fallbackName;
  const initials = getInitials(displayName);

  return (
    <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1, sm: 2 },
          position: 'relative',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: 0,
            flex: '0 0 auto',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img
              src="/RM360-LOGO.png"
              alt="RM360 Logo"
              style={{ height: isMobile ? 28 : 36, width: 'auto', marginRight: 8 }}
            />
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: 16, sm: 18, md: 20 },
                fontWeight: 700,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              RM360
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="h6"
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: '68%', sm: '56%', md: '44%' },
            fontSize: { xs: 14, sm: 16, md: 20 },
            fontWeight: 700,
            lineHeight: 1.2,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            pointerEvents: 'none',
          }}
        >
          {getTextByRole(get(user, 'role') as IUser['role'])}
        </Typography>

        {/* Mobile: nav items overflow menu */}
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
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              {navItems.map(item => (
                <MenuItem key={item} onClick={handleMenuClose}>
                  {item}
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : null}

        {/* Desktop/tablet: actions + user menu */}
        {!isMobile ? (
          <Box
            sx={{
              display: 'flex',
              gap: isTablet ? 1 : 2,
              flex: '0 0 auto',
              alignItems: 'center',
            }}
          >
            {navItems.map(item => (
              <Button key={item} color="inherit">
                {item}
              </Button>
            ))}
            <GoogleTranslateWidget />
            {/* {canWeShowChangeLanguageOption(user) && <LanguageMode />} */}
            {/* <ColorMode /> */}

            <ButtonBase
              aria-label="user-menu"
              onClick={handleUserMenuOpen}
              sx={{
                borderRadius: 999,
                px: 1,
                py: 0.5,
                color: 'inherit',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.10)' },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: 'inherit',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </Avatar>
                <Typography
                  variant="body2"
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    maxWidth: 180,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: 600,
                  }}
                >
                  {displayName}
                </Typography>
                <ArrowDropDownIcon sx={{ opacity: 0.9 }} />
              </Stack>
            </ButtonBase>

            <Menu
              anchorEl={userMenuAnchorEl}
              open={Boolean(userMenuAnchorEl)}
              onClose={handleUserMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 220,
                  borderRadius: 2,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.25 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {displayName}
                </Typography>
                {get(user, 'email') ? (
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.75,
                      display: 'block',
                      maxWidth: 260,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {String(get(user, 'email'))}
                  </Typography>
                ) : null}
              </Box>
              <Divider />

              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  navigate(ROUTES.PROFILE);
                }}
              >
                <ListItemIcon>
                  <PersonOutlineIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>

              <LogoutFeature>
                {openLogout => (
                  <MenuItem
                    onClick={() => {
                      handleUserMenuClose();
                      openLogout();
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                )}
              </LogoutFeature>
            </Menu>
          </Box>
        ) : null}

        {/* Mobile: show only user menu to prevent overflow */}
        {isMobile ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                minWidth: 0,
                '& select': { maxWidth: 120 },
              }}
            >
              <GoogleTranslateWidget />
            </Box>
            <ButtonBase
              aria-label="user-menu"
              onClick={handleUserMenuOpen}
              sx={{
                borderRadius: 999,
                px: 0.5,
                py: 0.25,
                color: 'inherit',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.10)' },
              }}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'inherit',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>
            </ButtonBase>

            <Menu
              anchorEl={userMenuAnchorEl}
              open={Boolean(userMenuAnchorEl)}
              onClose={handleUserMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 220,
                  borderRadius: 2,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.25 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {displayName}
                </Typography>
                {get(user, 'email') ? (
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.75,
                      display: 'block',
                      maxWidth: 260,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {String(get(user, 'email'))}
                  </Typography>
                ) : null}
              </Box>
              <Divider />

              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  navigate(ROUTES.PROFILE);
                }}
              >
                <ListItemIcon>
                  <PersonOutlineIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>

              <LogoutFeature>
                {openLogout => (
                  <MenuItem
                    onClick={() => {
                      handleUserMenuClose();
                      openLogout();
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                )}
              </LogoutFeature>
            </Menu>
          </Box>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};

const HeaderWithAuth = withAuthGuard(Header);

export default HeaderWithAuth;
