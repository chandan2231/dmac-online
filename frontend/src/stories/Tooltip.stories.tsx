import MorenTooltip from '../components/tooltip';
import Button from '../components/button';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Tooltip',
  component: MorenTooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MorenTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Add',
    children: <Button>Hover me</Button>,
  },
};

export const Positioned: Story = {
  args: {
    title: 'Top',
    children: <Button>Top</Button>,
  },
  render: () => (
    <div style={{ display: 'flex', gap: '20px' }}>
      <MorenTooltip title="Top" placement="top">
        <Button>Top</Button>
      </MorenTooltip>
      <MorenTooltip title="Right" placement="right">
        <Button>Right</Button>
      </MorenTooltip>
      <MorenTooltip title="Bottom" placement="bottom">
        <Button>Bottom</Button>
      </MorenTooltip>
      <MorenTooltip title="Left" placement="left">
        <Button>Left</Button>
      </MorenTooltip>
    </div>
  ),
};
