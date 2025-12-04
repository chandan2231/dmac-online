import type { Meta, StoryObj } from '@storybook/react-vite';
import ModernSwitch from '../components/switch';

const meta = {
  title: 'Components/Switch',
  component: ModernSwitch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ModernSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultChecked: false,
  },
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const CustomColor: Story = {
  args: {
    defaultChecked: true,
    trackColor: '#ff4081',
  },
};
