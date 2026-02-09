import React from 'react';
import Avatar, { type AvatarProps } from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  // Add custom styles here if needed
  // For example, default background color or border
  backgroundColor: theme.palette.grey[300],
}));

const MorenAvatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (props, ref) => {
    return <StyledAvatar ref={ref} {...props} />;
  }
);

export default MorenAvatar;
