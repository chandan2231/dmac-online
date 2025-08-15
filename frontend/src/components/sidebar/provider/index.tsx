import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { LOCAL_STORAGE_KEYS } from '../../../utils/constants';
import { getLocalStorageItem } from '../../../utils/functions';

interface SidebarContextProps {
  showDrawer: boolean;
  drawerOpen: boolean;
  toggleDrawer: () => void;
  closeDrawer: () => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider: React.FC<{
  showDrawer?: boolean;
  children: React.ReactNode;
}> = ({ showDrawer = true, children }) => {
  const [drawerOpen, setDrawerOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = getLocalStorageItem(LOCAL_STORAGE_KEYS.SIDEBAR_OPEN);
    setDrawerOpen(stored === 'false' ? false : true);
  }, []);

  const persistDrawerState = useCallback((value: boolean) => {
    setDrawerOpen(value);
    localStorage.setItem(LOCAL_STORAGE_KEYS.SIDEBAR_OPEN, String(value));
  }, []);

  const toggleDrawer = useCallback(() => {
    if (drawerOpen !== null) {
      persistDrawerState(!drawerOpen);
    }
  }, [drawerOpen, persistDrawerState]);

  const closeDrawer = useCallback(() => {
    persistDrawerState(false);
  }, [persistDrawerState]);

  if (drawerOpen === null) return null; // or a spinner

  return (
    <SidebarContext.Provider
      value={{
        showDrawer,
        drawerOpen,
        toggleDrawer,
        closeDrawer,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
