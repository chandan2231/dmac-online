import type { Meta, StoryObj } from '@storybook/react';
import MorenAvatar from '../components/avatar';

const meta = {
  title: 'Components/Avatar',
  component: MorenAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MorenAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'OP',
  },
};

export const Image: Story = {
  args: {
    alt: 'Remy Sharp',
    src: 'https://mui.com/static/images/avatar/1.jpg',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <MorenAvatar sx={{ width: 24, height: 24 }}>S</MorenAvatar>
      <MorenAvatar>M</MorenAvatar>
      <MorenAvatar sx={{ width: 56, height: 56 }}>L</MorenAvatar>
    </div>
  ),
};
