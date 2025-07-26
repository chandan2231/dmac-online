import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';

interface TabConfig {
  label: string;
  id: string;
  component: React.ReactNode;
}

interface DynamicTabsProps {
  tabs: TabConfig[];
  defaultTabId?: string;
  onTabChange?: (tabId: string) => void;
}

const DynamicTabs: React.FC<DynamicTabsProps> = ({
  tabs,
  defaultTabId,
  onTabChange,
}) => {
  const initialTab = defaultTabId || tabs[0]?.id;
  const [currentTab, setCurrentTab] = useState(initialTab);

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    onTabChange?.(newValue);
  };

  const activeTab = tabs.find(tab => tab.id === currentTab);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: theme => theme.palette.background.paper,
      }}
    >
      <Tabs value={currentTab} onChange={handleChange}>
        {tabs.map(tab => (
          <Tab key={tab.id} label={tab.label} value={tab.id} />
        ))}
      </Tabs>
      <Box sx={{ pt: 2 }}>
        {activeTab?.component || <div>No content found</div>}
      </Box>
    </Box>
  );
};

export default DynamicTabs;
