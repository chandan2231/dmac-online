import React from 'react';
import Checkbox, { type CheckboxProps } from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
}));

const MorenCheckbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (props, ref) => {
    return <StyledCheckbox ref={ref} {...props} />;
  }
);

export default MorenCheckbox;
