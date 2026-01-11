import {
  Collapse,
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
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { RootState } from '../../store';
import { get } from 'lodash';
import { useSidebarContext } from './provider';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../../utils/constants';
import { useSelector } from 'react-redux';
import { getSidebarOptions } from '../../utils/functions';
import { useLocation, useNavigate, matchPath } from 'react-router-dom';
import withAuthGuard from '../../middlewares/withAuthGuard';
import mappedIcons from './mapped-icons';
import { useMemo, useState } from 'react';

const Sidebar = () => {
  const { drawerOpen, toggleDrawer } = useSidebarContext();
  const { allowedRoutes } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const sidebarOptions = useMemo(
    () => getSidebarOptions(allowedRoutes),
    [allowedRoutes]
  );

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (path: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

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
        {sidebarOptions.map((option, index) => {
          const isActive =
            location.pathname === get(option, ['path']) ||
            (get(option, ['nestedRoutes'], []) as string[]).some(
              route =>
                typeof route === 'string' &&
                !!matchPath(route, location.pathname)
            );
          const IconComponent = mappedIcons(String(get(option, ['icon'])));

          const children = get(option, ['children'], []) as Array<
            typeof option
          >;
          const hasChildren = Array.isArray(children) && children.length > 0;
          const optionKey = String(
            get(option, ['key'], get(option, ['path'], ''))
          );
          const isGroupOpen = !!openGroups[optionKey];

          return (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <Tooltip
                title={!drawerOpen && !isMobile ? option.title : ''}
                placement="right"
              >
                <ListItemButton
                  onClick={() => {
                    if (hasChildren) {
                      toggleGroup(optionKey);
                      return;
                    }

                    const targetPath = get(option, ['path'], null);
                    if (!targetPath) return;

                    navigate(String(targetPath));
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
                  {(drawerOpen || isMobile) && hasChildren && (
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        ml: 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      {isGroupOpen ? (
                        <ExpandLessIcon fontSize="small" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" />
                      )}
                    </ListItemIcon>
                  )}
                </ListItemButton>
              </Tooltip>

              {hasChildren && (
                <Collapse in={isGroupOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {children.map((child, childIndex) => {
                      const childIsActive =
                        location.pathname === get(child, ['path']) ||
                        (get(child, ['nestedRoutes'], []) as string[]).some(
                          route =>
                            typeof route === 'string' &&
                            !!matchPath(route, location.pathname)
                        );
                      const ChildIconComponent = mappedIcons(
                        String(get(child, ['icon']))
                      );

                      return (
                        <ListItem
                          key={`${index}-${childIndex}`}
                          disablePadding
                          sx={{ display: 'block' }}
                        >
                          <Tooltip
                            title={!drawerOpen && !isMobile ? child.title : ''}
                            placement="right"
                          >
                            <ListItemButton
                              onClick={() => {
                                navigate(String(get(child, ['path'])));
                                if (isMobile) toggleDrawer();
                              }}
                              sx={{
                                minHeight: 44,
                                justifyContent:
                                  drawerOpen || isMobile ? 'initial' : 'center',
                                px: 2.5,
                                pl: drawerOpen || isMobile ? 6 : 2.5,
                                backgroundColor: childIsActive
                                  ? theme => theme.palette.action.selected
                                  : 'transparent',
                                '&:hover': {
                                  backgroundColor: childIsActive
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
                                <ChildIconComponent
                                  color={childIsActive ? 'primary' : 'inherit'}
                                />
                              </ListItemIcon>
                              {(drawerOpen || isMobile) && (
                                <ListItemText primary={child.title} />
                              )}
                            </ListItemButton>
                          </Tooltip>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </ListItem>
          );
        })}
      </List>
      {sidebarOptions.length > 0 && <Divider />}
    </Drawer>
  );
};

const SidebarWithAuth = withAuthGuard(Sidebar);

export default SidebarWithAuth;
