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
} from '@mui/material';
import type { RootState } from '../../store';
import { get } from 'lodash';
import { useSidebarContext } from './provider';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../../utils/constants';
import { useSelector } from 'react-redux';
import { getSidebarOptions } from '../../utils/functions';
import { useLocation, useNavigate } from 'react-router-dom';
import withAuthGuard from '../../middlewares/withAuthGuard';
import mappedIcons from './mapped-icons';

const Sidebar = () => {
  const { drawerOpen } = useSidebarContext();
  const { allowedRoutes } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

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
    </Drawer>
  );
};

const SidebarWithAuth = withAuthGuard(Sidebar);

export default SidebarWithAuth;
