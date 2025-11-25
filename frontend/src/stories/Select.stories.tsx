import type { Meta, StoryObj } from '@storybook/react-vite';
import ModernSelect, { type IOption } from '../components/select';
import { useState } from 'react';

const meta = {
  title: 'Components/Select',
  component: ModernSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ModernSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<IOption | null>(null);
    return (
      <div style={{ width: 300 }}>
        <ModernSelect
          {...args}
          value={value}
          onChange={(val: IOption) => setValue(val)}
        />
      </div>
    );
  },
  args: {
    label: 'Select Option',
    options: options,
    value: null,
    onChange: () => {},
  },
};

export const Searchable: Story = {
  render: args => {
    const [value, setValue] = useState<IOption | null>(null);
    return (
      <div style={{ width: 300 }}>
        <ModernSelect
          {...args}
          value={value}
          onChange={(val: IOption) => setValue(val)}
        />
      </div>
    );
  },
  args: {
    label: 'Searchable Select',
    options: options,
    value: null,
    onChange: () => {},
    searchable: true,
  },
};
