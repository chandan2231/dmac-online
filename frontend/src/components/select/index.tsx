// components/select/index.tsx
import React from 'react';
import { styled } from '@mui/material/styles';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

interface Option {
  label: string;
  value: string;
}

interface IModernSelectProps {
  label?: string;
  options: Option[];
  value: Option | null;
  placeholder?: string;
  id?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  onChange: (value: Option) => void;
  renderValue?: (value: Option | null) => React.ReactNode;
  error?: boolean;
  helperText?: React.ReactNode;
}

const Wrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  minWidth: 120,
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
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
  },

  '& .MuiSelect-select': {
    padding: '14px',
    fontWeight: 400,
    color: theme.palette.text.primary,
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 400,
    color: theme.palette.text.primary,
  },
}));

const ModernSelect = ({
  label = '',
  options = [],
  value = null,
  onChange,
  renderValue,
  placeholder = 'Select...',
  id = 'modern-select',
  size = 'medium',
  fullWidth = false,
  variant = 'outlined',
  error = false,
  helperText,
  ...props
}: IModernSelectProps) => {
  return (
    <Wrapper>
      {label && (
        <InputLabel id={`${id}-label`} shrink>
          {label}
        </InputLabel>
      )}

      <StyledFormControl
        fullWidth={fullWidth}
        size={size}
        variant={variant}
        error={error}
      >
        <StyledSelect
          labelId={`${id}-label`}
          id={id}
          value={value?.value || ''}
          onChange={event => {
            const selected = options.find(
              opt => opt.value === event.target.value
            );
            if (selected) {
              onChange(selected);
            }
          }}
          displayEmpty
          renderValue={
            renderValue
              ? selected => renderValue(selected as Option)
              : selected => {
                  const found = options.find(opt => opt.value === selected);
                  return found ? found.label : placeholder;
                }
          }
          {...props}
        >
          {options.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </StyledSelect>

        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </StyledFormControl>
    </Wrapper>
  );
};

export default ModernSelect;
