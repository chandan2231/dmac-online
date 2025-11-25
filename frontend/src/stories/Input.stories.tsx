import type { Meta, StoryObj } from '@storybook/react-vite';
import ModernInput from '../components/input';

const meta = {
  title: 'Components/Input',
  component: ModernInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ModernInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
  },
};

export const Error: Story = {
  args: {
    label: 'Error Input',
    error: true,
    helperText: 'Incorrect entry.',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    defaultValue: 'Cannot edit',
  },
};
