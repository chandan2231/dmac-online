// MorenButton.tsx
import React from 'react';
import Button, { type ButtonProps } from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Customize styles to reflect Moren UI look
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '999px',
  textTransform: 'none',
  fontWeight: 400,
  padding: '8px 16px',
  boxShadow: 'none',
  fontSize: '16px',
  width: '100%',
  height: '36px',

  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },

  // You can customize variants as needed
  '&.MuiButton-contained': {
    '&:hover': {},
  },

  '&.MuiButton-outlined': {
    borderColor: '#0072F5',
    color: '#0072F5',
    '&:hover': {
      backgroundColor: 'rgba(0, 114, 245, 0.1)',
    },
  },
}));

const MorenButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return <StyledButton ref={ref} {...props} />;
  }
);

export default MorenButton;
