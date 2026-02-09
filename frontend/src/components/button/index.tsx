// MorenButton.tsx
import React from 'react';
import Button, { type ButtonProps } from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Customize styles to reflect Moren UI look
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.morenButton?.borderRadius || '999px',
  textTransform: 'none',
  fontWeight: 400,
  padding: '8px 16px',
  boxShadow: 'none',
  fontSize: '16px',
  width: '100%',
  height: theme.morenButton?.height || '36px',

  '&:hover': {
    boxShadow: theme.shadows[2],
  },

  '&.MuiButton-contained': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },

  '&.MuiButton-outlined': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },

  '&.Mui-disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
    boxShadow: 'none',
  },
}));

const MorenButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return <StyledButton ref={ref} {...props} />;
  }
);

export default MorenButton;
