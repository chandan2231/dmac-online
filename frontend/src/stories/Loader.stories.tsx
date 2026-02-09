import type { Meta, StoryObj } from '@storybook/react-vite';
import CustomLoader from '../components/loader';

const meta = {
  title: 'Components/Loader',
  component: CustomLoader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CustomLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ height: '300px', position: 'relative' }}>
      <CustomLoader />
    </div>
  ),
};
