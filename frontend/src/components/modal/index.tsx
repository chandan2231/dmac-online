import React, { type ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  type DialogProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import MorenButton from '../button';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

type GenericModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subTitle?: string;
  children?: ReactNode;
  onSubmit?: () => void;
  hideSubmitButton?: boolean;
  hideCancelButton?: boolean;
  submitButtonText?: string;
  cancelButtonText?: string;
  maxWidth?: DialogProps['maxWidth'];
};

const GenericModal: React.FC<GenericModalProps> = ({
  isOpen,
  onClose,
  title,
  subTitle,
  children,
  onSubmit,
  hideSubmitButton = false,
  hideCancelButton = false,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  maxWidth = 'sm',
}) => {
  return (
    <StyledDialog
      onClose={onClose}
      open={isOpen}
      aria-labelledby="generic-modal-title"
      fullWidth
      maxWidth={maxWidth}
    >
      <DialogTitle
        id="generic-modal-title"
        sx={{ m: 0, p: 2, fontSize: '1.5rem' }}
      >
        {title}
      </DialogTitle>

      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent>
        {subTitle && (
          <Typography
            variant="h6"
            sx={{
              textAlign: 'left',
              fontSize: { xs: '0.875rem', sm: '0.875rem', md: '1rem' },
              fontWeight: 'bold',
              mb: 1,
            }}
          >
            {subTitle}
          </Typography>
        )}

        {children}
      </DialogContent>

      {(onSubmit || !hideCancelButton) && (
        <DialogActions>
          {!hideCancelButton && (
            <MorenButton
              onClick={onClose}
              variant="outlined"
              sx={{
                maxWidth: '150px',
              }}
            >
              {cancelButtonText}
            </MorenButton>
          )}
          {!hideSubmitButton && onSubmit && (
            <MorenButton
              onClick={onSubmit}
              variant="contained"
              sx={{
                maxWidth: '150px',
              }}
            >
              {submitButtonText}
            </MorenButton>
          )}
        </DialogActions>
      )}
    </StyledDialog>
  );
};

export default GenericModal;
