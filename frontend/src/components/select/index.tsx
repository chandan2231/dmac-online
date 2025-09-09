import React, { useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import { ListSubheader } from '@mui/material';

export interface IOption {
  label: string;
  value: string;
}

interface IModernSelectProps {
  label?: string;
  options: IOption[];
  value: IOption | null;
  placeholder?: string;
  id?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  onChange: (value: IOption) => void;
  renderValue?: (value: IOption | null) => React.ReactNode;
  error?: boolean;
  helperText?: React.ReactNode;
  searchable?: boolean; // <-- NEW PROP
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
  searchable = false, // <-- default to false
  ...props
}: IModernSelectProps & {
  [key: string]: unknown;
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered options
  const filteredOptions = useMemo(() => {
    if (!searchable) return options;
    return options.filter(opt =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, searchable]);

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | (Event & { target: { value: unknown; name?: string } })
  ) => {
    const value =
      typeof event.target.value === 'string' ? event.target.value : '';
    const selected = options.find(opt => opt.value === value);
    if (selected) {
      onChange(selected);
    }
  };

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
          onChange={handleChange}
          displayEmpty
          renderValue={
            renderValue
              ? selected => renderValue(selected as IOption)
              : selected => {
                  const found = options.find(opt => opt.value === selected);
                  return found ? found.label : placeholder;
                }
          }
          MenuProps={{
            autoFocus: false, // prevent auto-focus steal
          }}
          {...props}
        >
          {searchable && (
            <ListSubheader>
              <TextField
                size="small"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => {
                  // Prevent select from closing when typing
                  e.stopPropagation();
                }}
                fullWidth
              />
            </ListSubheader>
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No results</MenuItem>
          )}
        </StyledSelect>

        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </StyledFormControl>
    </Wrapper>
  );
};

export default ModernSelect;
