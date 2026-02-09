import type { Meta, StoryObj } from '@storybook/react-vite';
import MorenDivider from '../components/divider';
import MorenTypography from '../components/typography';

const meta = {
  title: 'Components/Divider',
  component: MorenDivider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MorenDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: '300px' }}>
      <MorenTypography>Item 1</MorenTypography>
      <MorenDivider />
      <MorenTypography>Item 2</MorenTypography>
      <MorenDivider />
      <MorenTypography>Item 3</MorenTypography>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div style={{ width: '300px' }}>
      <MorenTypography>Content above</MorenTypography>
      <MorenDivider>CENTER</MorenDivider>
      <MorenTypography>Content below</MorenTypography>
      <MorenDivider textAlign="left">LEFT</MorenDivider>
      <MorenTypography>Content below</MorenTypography>
      <MorenDivider textAlign="right">RIGHT</MorenDivider>
      <MorenTypography>Content below</MorenTypography>
    </div>
  ),
};
