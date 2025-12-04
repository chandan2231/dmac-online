import type { Meta, StoryObj } from '@storybook/react';
import MorenTypography from '../components/typography';

const meta = {
  title: 'Components/Typography',
  component: MorenTypography,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MorenTypography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Typography',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <MorenTypography variant="h1">h1. Heading</MorenTypography>
      <MorenTypography variant="h2">h2. Heading</MorenTypography>
      <MorenTypography variant="h3">h3. Heading</MorenTypography>
      <MorenTypography variant="h4">h4. Heading</MorenTypography>
      <MorenTypography variant="h5">h5. Heading</MorenTypography>
      <MorenTypography variant="h6">h6. Heading</MorenTypography>
      <MorenTypography variant="subtitle1">
        subtitle1. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        Quos blanditiis tenetur
      </MorenTypography>
      <MorenTypography variant="subtitle2">
        subtitle2. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        Quos blanditiis tenetur
      </MorenTypography>
      <MorenTypography variant="body1">
        body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
        blanditiis tenetur unde suscipit, quam beatae rerum inventore
        consectetur, neque doloribus, cupiditate numquam dignissimos laborum
        fugiat deleniti? Eum quasi quidem quibusdam.
      </MorenTypography>
      <MorenTypography variant="body2">
        body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
        blanditiis tenetur unde suscipit, quam beatae rerum inventore
        consectetur, neque doloribus, cupiditate numquam dignissimos laborum
        fugiat deleniti? Eum quasi quidem quibusdam.
      </MorenTypography>
      <MorenTypography variant="button" display="block">
        button text
      </MorenTypography>
      <MorenTypography variant="caption" display="block">
        caption text
      </MorenTypography>
      <MorenTypography variant="overline" display="block">
        overline text
      </MorenTypography>
    </div>
  ),
};
