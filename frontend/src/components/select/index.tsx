import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';

// Styled wrapper for modern UI
const Wrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  borderRadius: 999,
  maxWidth: 120,
  minWidth: 120,
}));

// Custom styled select
const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 999,
  '& .MuiSelect-select': {
    padding: theme.spacing(0.7, 1),
  },
}));

export { Wrapper, StyledSelect };
