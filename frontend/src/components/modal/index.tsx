import React from 'react';
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
import TextToSpeech from '../TextToSpeech';
import CustomLoader from '../loader';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiPaper-root': {
    borderRadius: theme.spacing(1),
  },
}));

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  title?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  hideCancelButton?: boolean;
  children: React.ReactNode;
  enableAudio?: boolean;
  instructionText?: string;
  languageCode?: string;
  subTitle?: string;
  hideSubmitButton?: boolean;
  maxWidth?: DialogProps['maxWidth'];
  onCancel?: () => void | null;
  isLoading?: boolean;
  renderHtmlContent?: string;
  submitDisabled?: boolean;
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
  maxWidth = 'lg',
  onCancel = null,
  isLoading = false,
  renderHtmlContent = null,
  submitDisabled = false,
  enableAudio = false,
  instructionText = '',
  languageCode = 'en',
}) => {
  if (isLoading) {
    return <CustomLoader />;
  }

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
        sx={{
          m: 0,
          p: 2,
          fontSize: '1.5rem',
          backgroundColor: theme => theme.palette.primary.main,
          color: theme => theme.palette.common.white,
        }}
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
          color: theme => theme.palette.common.white,
          backgroundColor: theme => theme.palette.grey[700],
          '&:hover': {
            backgroundColor: theme => theme.palette.grey[900],
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      {renderHtmlContent && (
        <DialogContent dividers sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div
            dangerouslySetInnerHTML={{ __html: renderHtmlContent }}
            className="ql-editor"
          />
        </DialogContent>
      )}

      {children || subTitle ? (
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
      ) : null}

      {(onSubmit || !hideCancelButton) && (
        <DialogActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
          {enableAudio && instructionText && (
            <TextToSpeech
              text={instructionText}
              languageCode={languageCode}
              iconSize="large"
              color="primary"
            />
          )}
          {!hideCancelButton && (
            <MorenButton
              onClick={() => {
                if (onCancel) {
                  return onCancel();
                }
                onClose();
              }}
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
              disabled={submitDisabled}
              sx={{
                minWidth: '150px',
                width: 'auto',
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
