import ModernMultiSelect from '../components/multi-select';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta: Meta<typeof ModernMultiSelect> = {
  title: 'Components/MultiSelect',
  component: ModernMultiSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    searchable: { control: 'boolean' },
    error: { control: 'boolean' },
    helperText: { control: 'text' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
  { label: 'Option 3', value: 'opt3' },
  { label: 'Option 4', value: 'opt4' },
  { label: 'Option 5', value: 'opt5' },
];

export const Default: Story = {
  args: {
    label: 'Select Options',
    options: options,
    value: [],
    placeholder: 'Select...',
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return <ModernMultiSelect {...args} value={value} onChange={setValue} />;
  },
};

export const Searchable: Story = {
  args: {
    ...Default.args,
    searchable: true,
    label: 'Searchable Select',
  },
  render: Default.render,
};

export const WithError: Story = {
  args: {
    ...Default.args,
    error: true,
    helperText: 'This field is required',
    label: 'Error Select',
  },
  render: Default.render,
};
