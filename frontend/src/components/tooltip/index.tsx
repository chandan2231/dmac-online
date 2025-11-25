import React from 'react';
import Tooltip, {
  type TooltipProps,
  tooltipClasses,
} from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    boxShadow: theme.shadows[1],
    fontSize: 12,
  },
}));

const MorenTooltip = (props: TooltipProps) => {
  return <StyledTooltip {...props} />;
};

export default MorenTooltip;
