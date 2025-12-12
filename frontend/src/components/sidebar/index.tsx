import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import type { RootState } from '../../store';
import { get } from 'lodash';
import { useSidebarContext } from './provider';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../../utils/constants';
import { useSelector } from 'react-redux';
import { getSidebarOptions } from '../../utils/functions';
import { useLocation, useNavigate, matchPath } from 'react-router-dom';
import withAuthGuard from '../../middlewares/withAuthGuard';
import mappedIcons from './mapped-icons';

const Sidebar = () => {
  const { drawerOpen, toggleDrawer } = useSidebarContext();
  const { allowedRoutes } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    toggleDrawer();
  };

  const drawerWidth = isMobile
    ? DRAWER_WIDTH
    : drawerOpen
      ? DRAWER_WIDTH
      : MINI_DRAWER_WIDTH;

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? drawerOpen : true}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        transition: 'width 0.3s',
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          transition: 'width 0.3s',
          overflowX: 'hidden',
        },
        backgroundColor: theme => theme.palette.background.paper,
      }}
    >
      <Toolbar />
      <List>
        {getSidebarOptions(allowedRoutes).map((option, index) => {
          const isActive =
            location.pathname === get(option, ['path']) ||
            (get(option, ['nestedRoutes'], []) as string[]).some(
              route =>
                typeof route === 'string' &&
                !!matchPath(route, location.pathname)
            );
          const IconComponent = mappedIcons(String(get(option, ['icon'])));
          return (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <Tooltip
                title={!drawerOpen && !isMobile ? option.title : ''}
                placement="right"
              >
                <ListItemButton
                  onClick={() => {
                    navigate(String(get(option, ['path'])));
                    if (isMobile) toggleDrawer();
                  }}
                  sx={{
                    minHeight: 48,
                    justifyContent:
                      drawerOpen || isMobile ? 'initial' : 'center',
                    px: 2.5,
                    backgroundColor: isActive
                      ? theme => theme.palette.action.selected
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: isActive
                        ? theme => theme.palette.action.selected
                        : 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: drawerOpen || isMobile ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent color={isActive ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  {(drawerOpen || isMobile) && (
                    <ListItemText primary={option.title} />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
      {getSidebarOptions(allowedRoutes).length > 0 && <Divider />}
    </Drawer>
  );
};

const SidebarWithAuth = withAuthGuard(Sidebar);

export default SidebarWithAuth;
