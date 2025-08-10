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
} from '@mui/material';
import { useSidebarContext } from '../sidebar/provider';
import MenuIcon from '@mui/icons-material/Menu';
import withAuthGuard from '../../middlewares/withAuthGuard';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const navItems: string[] = [];

const Header = () => {
  const theme = useTheme();
  const { drawerOpen, toggleDrawer } = useSidebarContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
          onClick={toggleDrawer}
        >
          {drawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
          DMAC
        </Typography>

        {/* Mobile */}
        {isMobile && (
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
        )}

        {/*  Desktop */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {navItems.length > 0 &&
              navItems.map(item => (
                <Button key={item} color="inherit">
                  {item}
                </Button>
              ))}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

const HeaderWithAuth = withAuthGuard(Header);

export default HeaderWithAuth;
