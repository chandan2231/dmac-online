import type { Meta, StoryObj } from '@storybook/react-vite';
import MorenBadge from '../components/badge';
import MailIcon from '@mui/icons-material/Mail';

const meta = {
  title: 'Components/Badge',
  component: MorenBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MorenBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    badgeContent: 4,
    color: 'primary',
    children: <MailIcon />,
  },
};

export const Dot: Story = {
  args: {
    variant: 'dot',
    color: 'secondary',
    children: <MailIcon />,
  },
};

export const Max: Story = {
  args: {
    badgeContent: 100,
    color: 'error',
    max: 99,
    children: <MailIcon />,
  },
};
