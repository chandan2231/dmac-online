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
      borderColor: '#ddd',
    },
    '&:hover fieldset': {},
    '&.Mui-focused fieldset': {
      borderColor: '#0072F5',
      borderWidth: 2,
    },
  },

  '& input': {
    fontWeight: 400,
  },
}));

const ModernInput = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (props, ref) => {
    return <StyledInput inputRef={ref} fullWidth {...props} />;
  }
);

export default ModernInput;
