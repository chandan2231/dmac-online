import React from 'react';
import Divider, { type DividerProps } from '@mui/material/Divider';
import { styled } from '@mui/material/styles';

const StyledDivider = styled(Divider)(({ theme }) => ({
  // Add custom styles here if needed
  backgroundColor: theme.palette.divider,
}));

const MorenDivider = React.forwardRef<HTMLHRElement, DividerProps>(
  (props, ref) => {
    return <StyledDivider ref={ref} {...props} />;
  }
);

export default MorenDivider;
