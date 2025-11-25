import type { Meta, StoryObj } from '@storybook/react';
import MorenChip from '../components/chip';

const meta = {
  title: 'Components/Chip',
  component: MorenChip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MorenChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Chip',
  },
};

export const Clickable: Story = {
  args: {
    label: 'Clickable',
    onClick: () => alert('Clicked!'),
  },
};

export const Deletable: Story = {
  args: {
    label: 'Deletable',
    onDelete: () => alert('Deleted!'),
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <MorenChip label="Filled" variant="filled" />
      <MorenChip label="Outlined" variant="outlined" />
    </div>
  ),
};
