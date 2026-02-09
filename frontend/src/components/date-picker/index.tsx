import React from 'react';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

interface IModernDatePickerProps
  extends React.ComponentProps<typeof DatePicker> {
  label?: string;
  error?: boolean;
  helperText?: React.ReactNode;
  fullWidth?: boolean;
  id?: string;
}

const Wrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  minWidth: 120,
}));

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: 'transparent',

    '& fieldset': {
      borderColor: theme.colors?.inputBorder || theme.palette.divider,
    },

    '&:hover fieldset': {
      borderColor: theme.palette.primary.light,
    },

    '&.Mui-focused fieldset': {
      borderColor: theme.colors?.focusBorder || theme.palette.primary.main,
      borderWidth: '2px',
    },

    '& input': {
      padding: '14px',
      fontWeight: 400,
      color: theme.palette.text.primary,
    },
  },
})) as typeof DatePicker;

const ModernDatePicker = ({
  label,
  value,
  onChange,
  error = false,
  helperText,
  fullWidth = false,
  id = 'modern-date-picker',
  slotProps,
  ...props
}: IModernDatePickerProps) => {
  return (
    <Wrapper sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <InputLabel id={`${id}-label`} shrink>
          {label}
        </InputLabel>
      )}
      <FormControl fullWidth={fullWidth} error={error}>
        <StyledDatePicker
          value={value}
          onChange={onChange}
          slotProps={{
            ...slotProps,
            textField: {
              ...slotProps?.textField,
              id: id,
              error: error,
              fullWidth: fullWidth,
            },
          }}
          {...props}
        />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </Wrapper>
  );
};

export default ModernDatePicker;
