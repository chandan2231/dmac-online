import React from 'react';
import Badge, { type BadgeProps } from '@mui/material/Badge';
import { styled } from '@mui/material/styles';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    // Custom styles for the badge content
  },
}));

const MorenBadge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (props, ref) => {
    return <StyledBadge ref={ref} {...props} />;
  }
);

export default MorenBadge;
