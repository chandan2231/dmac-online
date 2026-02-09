import type { Meta, StoryObj } from '@storybook/react-vite';
import MorenRadio from '../components/radio-input';
import { FormControlLabel, RadioGroup } from '@mui/material';

const meta = {
  title: 'Components/RadioInput',
  component: MorenRadio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MorenRadio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    checked: true,
  },
};

export const Group: Story = {
  render: () => (
    <RadioGroup defaultValue="female" name="radio-buttons-group">
      <FormControlLabel
        value="female"
        control={<MorenRadio />}
        label="Female"
      />
      <FormControlLabel value="male" control={<MorenRadio />} label="Male" />
      <FormControlLabel value="other" control={<MorenRadio />} label="Other" />
    </RadioGroup>
  ),
};
