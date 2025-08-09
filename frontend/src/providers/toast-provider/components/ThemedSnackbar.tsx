import { styled } from '@mui/material/styles';
import { MaterialDesignContent } from 'notistack';

// Theme-aware snackbar styles
export const ThemedSnackbar = styled(MaterialDesignContent)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  fontSize: theme.typography.body2.fontSize,
  color: theme.palette.getContrastText(theme.palette.background.default),

  '&.notistack-MuiContent-default': {
    backgroundColor: theme.palette.grey[700],
  },
  '&.notistack-MuiContent-success': {
    backgroundColor: theme.palette.success.main,
  },
  '&.notistack-MuiContent-error': {
    backgroundColor: theme.palette.error.main,
  },
  '&.notistack-MuiContent-warning': {
    backgroundColor: theme.palette.warning.main,
  },
  '&.notistack-MuiContent-info': {
    backgroundColor: theme.palette.info.main,
  },
}));
