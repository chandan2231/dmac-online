import type { Meta, StoryObj } from '@storybook/react-vite';
import MorenCard from '../components/card';
import { Button } from '@mui/material';

const meta = {
  title: 'Components/Card',
  component: MorenCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MorenCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    description: 'This is a description of the card content.',
    children: <Button size="small">Learn More</Button>,
  },
};

export const WithImage: Story = {
  args: {
    title: 'Lizard',
    description:
      'Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica',
    image: 'https://mui.com/static/images/cards/contemplative-reptile.jpg',
    maxWidth: 345,
    children: <Button size="small">Share</Button>,
  },
};
