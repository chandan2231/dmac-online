import type { Meta, StoryObj } from '@storybook/react-vite';
import GenericModal from '../components/modal';
import { Typography } from '@mui/material';
import { useState } from 'react';
import Button from '../components/button';

const meta = {
  title: 'Components/Modal',
  component: GenericModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GenericModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <GenericModal
          {...args}
          isOpen={open}
          onClose={() => setOpen(false)}
          onSubmit={() => {
            alert('Submitted');
            setOpen(false);
          }}
        >
          <Typography>This is the modal content.</Typography>
        </GenericModal>
      </>
    );
  },
  args: {
    title: 'Modal Title',
    subTitle: 'Modal Subtitle',
    isOpen: false,
    onClose: () => {},
    children: null,
  },
};
