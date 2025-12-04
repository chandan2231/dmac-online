import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabHeaderLayout } from '../components/tab-header';
import { Typography, Button } from '@mui/material';

const meta = {
  title: 'Components/TabHeader',
  component: TabHeaderLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TabHeaderLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    leftNode: <Typography variant="h5">Page Title</Typography>,
    rightNode: <Button variant="contained">Action</Button>,
    children: <Typography>Page content goes here...</Typography>,
    padding: 2,
  },
};
