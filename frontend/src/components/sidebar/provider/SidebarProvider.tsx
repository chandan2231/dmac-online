import React, { useCallback, useState } from 'react';
import { LOCAL_STORAGE_KEYS } from '../../../utils/constants';
import { getLocalStorageItem } from '../../../utils/functions';
import { SidebarContext } from './context';

export const SidebarProvider: React.FC<{
  showDrawer?: boolean;
  children: React.ReactNode;
}> = ({ showDrawer = true, children }) => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(() => {
    try {
      const stored = getLocalStorageItem(LOCAL_STORAGE_KEYS.SIDEBAR_OPEN);
      return stored === 'false' ? false : true;
    } catch {
      return true;
    }
  });

  const persistDrawerState = useCallback((value: boolean) => {
    setDrawerOpen(value);
    localStorage.setItem(LOCAL_STORAGE_KEYS.SIDEBAR_OPEN, String(value));
  }, []);

  const toggleDrawer = useCallback(() => {
    persistDrawerState(!drawerOpen);
  }, [drawerOpen, persistDrawerState]);

  const closeDrawer = useCallback(() => {
    persistDrawerState(false);
  }, [persistDrawerState]);

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
