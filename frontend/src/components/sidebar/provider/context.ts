import { createContext, useContext } from 'react';

export interface SidebarContextProps {
  showDrawer: boolean;
  drawerOpen: boolean;
  toggleDrawer: () => void;
  closeDrawer: () => void;
}

export const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};
