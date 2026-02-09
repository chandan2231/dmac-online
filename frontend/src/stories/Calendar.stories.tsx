import dayjs from 'dayjs';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ModernCalendar from '../components/calendar';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState } from 'react';

const meta: Meta<typeof ModernCalendar> = {
  title: 'Components/Calendar',
  component: ModernCalendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Story />
      </LocalizationProvider>
    ),
  ],
  argTypes: {
    elevation: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    elevation: 1,
    value: dayjs(),
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <ModernCalendar
        {...args}
        value={value}
        onChange={newValue => setValue(newValue)}
      />
    );
  },
};
