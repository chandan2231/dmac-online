import type { Meta, StoryObj } from '@storybook/react-vite';
import ProgressiveImage from '../components/progressive-image';

const meta = {
  title: 'Components/ProgressiveImage',
  component: ProgressiveImage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProgressiveImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    placeholderSrc: 'https://via.placeholder.com/150',
    alt: 'Beautiful Landscape',
    width: 500,
    height: 300,
  },
};
