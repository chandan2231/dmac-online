import React from 'react';
import Switch, { type SwitchProps } from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

interface ModernSwitchProps extends SwitchProps {
  trackColor?: string;
}

const StyledSwitch = styled(Switch, {
  shouldForwardProp: prop => prop !== 'trackColor', // prevent it from going to DOM
})<ModernSwitchProps>(({ theme, trackColor }) => {
  const defaultTrackColor = theme.palette.grey[300];
  const finalTrackColor = trackColor || defaultTrackColor;

  return {
    width: 42,
    height: 26,
    padding: 0,
    display: 'flex',

    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 2,
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: 'translateX(16px)',
        color: theme.palette.common.white,
        '& + .MuiSwitch-track': {
          backgroundColor: finalTrackColor, // fallback if not provided
          opacity: 1,
          border: 0,
        },
      },
    },

    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: 22,
      height: 22,
      borderRadius: '50%',
    },

    '& .MuiSwitch-track': {
      borderRadius: 26 / 2,
      backgroundColor: finalTrackColor, // fallback if not provided
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 300,
      }),
    },
  };
});

const ModernSwitch = React.forwardRef<HTMLButtonElement, ModernSwitchProps>(
  (props, ref) => <StyledSwitch ref={ref} {...props} />
);

export default ModernSwitch;
