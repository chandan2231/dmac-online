import React from 'react';
import Chip, { type ChipProps } from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: '8px', // Example customization
  fontWeight: 500,
  backgroundColor: theme.palette.background.paper,
}));

const MorenChip = React.forwardRef<HTMLDivElement, ChipProps>((props, ref) => {
  return <StyledChip ref={ref} {...props} />;
});

export default MorenChip;
