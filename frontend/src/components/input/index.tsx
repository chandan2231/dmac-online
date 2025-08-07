// ModernInput.tsx
import React from 'react';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

const StyledInput = styled((props: TextFieldProps) => (
  <TextField {...props} variant="outlined" />
))(({ theme }) => ({
  width: '100%',
  '& .MuiInputBase-input': {
    padding: '14px',
    lineHeight: '0',
  },

  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: 'transparent',

    '& fieldset': {
      borderColor: theme.colors?.inputBorder || theme.palette.divider,
    },

    '&:hover fieldset': {
      borderColor: theme.palette.primary.light, // Optional hover color
    },

    '&.Mui-focused fieldset': {
      borderColor: theme.colors?.focusBorder || theme.palette.primary.main,
      borderWidth: '2px',
    },
  },

  '& input': {
    fontWeight: 400,
    color: theme.palette.text.primary, // Input text color
  },
}));

const ModernInput = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (props, ref) => {
    return <StyledInput inputRef={ref} fullWidth {...props} />;
  }
);

export default ModernInput;
