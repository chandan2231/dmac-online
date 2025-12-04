import dayjs from 'dayjs';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ModernDatePicker from '../components/date-picker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState } from 'react';

const meta: Meta<typeof ModernDatePicker> = {
  title: 'Components/DatePicker',
  component: ModernDatePicker,
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
    label: { control: 'text' },
    error: { control: 'boolean' },
    helperText: { control: 'text' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Select Date',
    value: null,
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return (
      <ModernDatePicker
        {...args}
        value={value}
        onChange={newValue => setValue(newValue)}
      />
    );
  },
};

export const WithValue: Story = {
  args: {
    label: 'Date with Value',
    value: dayjs(),
  },
  render: Default.render,
};

export const ErrorState: Story = {
  args: {
    label: 'Error Date',
    error: true,
    helperText: 'Invalid date',
    value: null,
  },
  render: Default.render,
};
