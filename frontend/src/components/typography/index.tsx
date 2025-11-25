import React from 'react';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

const StyledTypography = styled(Typography)(({ theme }) => ({
  // Add custom typography styles here if needed
  // For example, enforcing a specific font family or color
}));

const MorenTypography = React.forwardRef<HTMLElement, TypographyProps>(
  (props, ref) => {
    return <StyledTypography ref={ref} {...props} />;
  }
);

export default MorenTypography;
