import React, { useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import { ListSubheader } from '@mui/material';

export interface IOption {
  label: string;
  value: string;
}

interface IModernMultiSelectProps {
  label?: string;
  options: IOption[];
  value: string[]; // Array of values
  placeholder?: string;
  id?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  onChange: (value: string[]) => void;
  error?: boolean;
  helperText?: React.ReactNode;
  searchable?: boolean;
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

const ModernMultiSelect = ({
  label = '',
  options = [],
  value = [],
  onChange,
  placeholder = 'Select...',
  id = 'modern-multi-select',
  size = 'medium',
  fullWidth = false,
  variant = 'outlined',
  error = false,
  helperText,
  searchable = false,
  ...props
}: IModernMultiSelectProps & {
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

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const {
      target: { value: selectedValue },
    } = event;

    // On autofill we get a stringified value.
    const newValue =
      typeof selectedValue === 'string'
        ? selectedValue.split(',')
        : selectedValue;
    onChange(newValue as string[]);
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
          multiple
          value={value}
          onChange={handleChange}
          displayEmpty
          renderValue={selected => {
            const selectedValues = selected as string[];
            if (selectedValues.length === 0) {
              return <span style={{ opacity: 0.5 }}>{placeholder}</span>;
            }

            // Map values to labels
            const selectedLabels = selectedValues.map(val => {
              const option = options.find(o => o.value === val);
              return option ? option.label : val;
            });

            return selectedLabels.join(', ');
          }}
          MenuProps={{
            autoFocus: false,
            PaperProps: {
              style: {
                maxHeight: 300,
              },
            },
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
                  e.stopPropagation();
                }}
                fullWidth
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                }}
                sx={{ p: 1 }}
              />
            </ListSubheader>
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={value.indexOf(option.value) > -1} />
                <ListItemText primary={option.label} />
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

export default ModernMultiSelect;
