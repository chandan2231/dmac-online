import type { Meta, StoryObj } from '@storybook/react-vite';
import FloatingPositionedBox from '../components/box';
import { Typography } from '@mui/material';

const meta = {
  title: 'Components/Box',
  component: FloatingPositionedBox,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FloatingPositionedBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TopRight: Story = {
  args: {
    position: 'top-right',
    children: (
      <div
        style={{
          background: 'white',
          padding: '10px',
          border: '1px solid #ccc',
        }}
      >
        <Typography>Top Right Box</Typography>
      </div>
    ),
  },
};

export const BottomLeft: Story = {
  args: {
    position: 'bottom-left',
    children: (
      <div
        style={{
          background: 'white',
          padding: '10px',
          border: '1px solid #ccc',
        }}
      >
        <Typography>Bottom Left Box</Typography>
      </div>
    ),
  },
};
