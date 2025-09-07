import React from 'react';
import Switch, { type SwitchProps } from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

const StyledSwitch = styled((props: SwitchProps) => <Switch {...props} />)(
  ({ theme }) => ({
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
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: theme.palette.primary.main,
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
      backgroundColor:
        theme.palette.mode === 'light'
          ? theme.palette.grey[400]
          : theme.palette.grey[700],
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 300,
      }),
    },
  })
);

const ModernSwitch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (props, ref) => {
    return <StyledSwitch ref={ref} {...props} />;
  }
);

export default ModernSwitch;
