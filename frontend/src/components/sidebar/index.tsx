import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
} from '@mui/material';
import type { RootState } from '../../store';
import { get } from 'lodash';
import { useSidebarContext } from './provider';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../../utils/constants';
import { useDispatch } from 'react-redux';
import { openLogoutModal } from '../../features/auth/components/logout/logout.slice';
import { useThemeContext } from '../../providers/theme-provider/ThemeContext';
import { useSelector } from 'react-redux';
import { getSidebarOptions } from '../../utils/functions';
import { useLocation, useNavigate } from 'react-router-dom';
import withAuthGuard from '../../middlewares/withAuthGuard';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import LogoutIcon from '@mui/icons-material/Logout';
import ColorMode from '../../providers/theme-provider/ColorMode';
import LogoutFeature from '../../features/auth/components/logout';
import mappedIcons from './mapped-icons';

const sidebarOptions = (
  handleLogoutModal: () => void,
  handleThemeModal: () => void
) => [
  {
    title: 'Color Mode',
    icon: <ColorLensIcon />,
    action: handleThemeModal,
  },
  {
    title: 'Logout',
    icon: <LogoutIcon />,
    action: handleLogoutModal,
  },
];

const Sidebar = () => {
  const { drawerOpen } = useSidebarContext();
  const { setIsThemeModalOpen } = useThemeContext();
  const { allowedRoutes } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleLogoutModal = () => {
    dispatch(openLogoutModal());
  };

  const handleThemeModal = () => {
    setIsThemeModalOpen(true);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        transition: 'width 0.3s',
        [`& .MuiDrawer-paper`]: {
          width: drawerOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
          transition: 'width 0.3s',
          overflowX: 'hidden',
        },
        backgroundColor: theme => theme.palette.background.paper,
      }}
    >
      <Toolbar />
      <List>
        {getSidebarOptions(allowedRoutes).map((option, index) => {
          const isActive = location.pathname === get(option, ['path']);
          const IconComponent = mappedIcons(String(get(option, ['icon'])));
          return (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <Tooltip
                title={!drawerOpen ? option.title : ''}
                placement="right"
              >
                <ListItemButton
                  onClick={() => navigate(String(get(option, ['path'])))}
                  sx={{
                    minHeight: 48,
                    justifyContent: drawerOpen ? 'initial' : 'center',
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
                      mr: drawerOpen ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent color={isActive ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  {drawerOpen && <ListItemText primary={option.title} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
      {getSidebarOptions(allowedRoutes).length > 0 && <Divider />}
      <List>
        {sidebarOptions(handleLogoutModal, handleThemeModal).map(
          (option, index) => (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <Tooltip
                title={!drawerOpen ? option.title : ''}
                placement="right"
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: drawerOpen ? 'initial' : 'center',
                    px: 2.5,
                  }}
                  onClick={() => option.action()}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: drawerOpen ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {option.icon}
                  </ListItemIcon>
                  {drawerOpen && <ListItemText primary={option.title} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          )
        )}
      </List>

      <Box
        sx={{
          display: 'none',
        }}
      >
        <ColorMode />
        <LogoutFeature />
      </Box>
    </Drawer>
  );
};

const SidebarWithAuth = withAuthGuard(Sidebar);

export default SidebarWithAuth;
