import type { Meta, StoryObj } from '@storybook/react-vite';
import DynamicTabs from '../components/tabs';
import { Typography } from '@mui/material';

const meta = {
  title: 'Components/Tabs',
  component: DynamicTabs,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DynamicTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabs = [
  {
    id: 'tab1',
    label: 'Tab 1',
    component: <Typography p={3}>Content for Tab 1</Typography>,
  },
  {
    id: 'tab2',
    label: 'Tab 2',
    component: <Typography p={3}>Content for Tab 2</Typography>,
  },
  {
    id: 'tab3',
    label: 'Tab 3',
    component: <Typography p={3}>Content for Tab 3</Typography>,
  },
];

export const Default: Story = {
  args: {
    tabs: tabs,
  },
};

export const WithDefaultTab: Story = {
  args: {
    tabs: tabs,
    defaultTabId: 'tab2',
  },
};
