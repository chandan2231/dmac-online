import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  type DialogProps,
  Box,
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
  hideCloseIcon?: boolean;
  disableClose?: boolean;
  children: React.ReactNode;
  enableAudio?: boolean;
  instructionText?: string;
  languageCode?: string;
  subTitle?: string;
  hideSubmitButton?: boolean;
  maxWidth?: DialogProps['maxWidth'];
  fullWidth?: boolean;
  size?: 'default' | 'compact';
  onCancel?: () => void | null;
  isLoading?: boolean;
  renderHtmlContent?: string;
  submitDisabled?: boolean;
  audioButtonLabel?: string;
  audioButtonAlignment?: 'left' | 'right' | 'center';
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
  hideCloseIcon = false,
  disableClose = false,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  maxWidth = 'lg',
  fullWidth = true,
  size = 'default',
  onCancel = null,
  isLoading = false,
  renderHtmlContent = null,
  submitDisabled = false,
  enableAudio = false,
  instructionText = '',
  languageCode = 'en',
  audioButtonLabel,
  audioButtonAlignment = 'right',
}) => {
  if (isLoading) {
    return <CustomLoader />;
  }
  const isCompact = size === 'compact';

  const handleDialogClose: DialogProps['onClose'] = (_event, reason) => {
    if (disableClose && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
      return;
    }
    onClose();
  };

  return (
    <StyledDialog
      onClose={handleDialogClose}
      open={isOpen}
      aria-labelledby="generic-modal-title"
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      disableEscapeKeyDown={disableClose}
      sx={
        isCompact
          ? {
              '& .MuiDialogContent-root': { padding: 1.5 },
              '& .MuiDialogActions-root': { padding: 1.25, gap: 1 },
              '& .MuiPaper-root': { borderRadius: 2 },
            }
          : undefined
      }
    >
      <DialogTitle
        id="generic-modal-title"
        sx={{
          m: 0,
          p: isCompact ? 1.5 : 2,
          fontSize: isCompact ? '1.125rem' : '1.5rem',
          backgroundColor: theme => theme.palette.primary.main,
          color: theme => theme.palette.common.white,
        }}
      >
        {title}
      </DialogTitle>

      {!hideCloseIcon && (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: isCompact ? 6 : 8,
            top: isCompact ? 6 : 8,
            color: theme => theme.palette.common.white,
            backgroundColor: theme => theme.palette.grey[700],
            '&:hover': {
              backgroundColor: theme => theme.palette.grey[900],
            },
          }}
        >
          <CloseIcon fontSize={isCompact ? 'small' : 'medium'} />
        </IconButton>
      )}

      {renderHtmlContent && (
        <DialogContent dividers sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div
            dangerouslySetInnerHTML={{ __html: renderHtmlContent }}
            className="ql-editor"
          />
        </DialogContent>
      )}

      {children || subTitle ? (
        <DialogContent sx={isCompact ? { py: 1.5 } : undefined}>
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
            <Box sx={{
              marginRight: audioButtonAlignment === 'left' ? 'auto' : (audioButtonAlignment === 'center' ? 'auto' : 0),
              marginLeft: audioButtonAlignment === 'center' ? 'auto' : 0,
              width: 'auto' // Ensure Box doesn't expand unexpectedly
            }}>
              <TextToSpeech
                text={instructionText}
                languageCode={languageCode}
                iconSize="large"
                color="primary"
                label={audioButtonLabel}
              />
            </Box>
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
                width: isCompact ? 'auto' : undefined,
                px: isCompact ? 2 : undefined,
                fontSize: isCompact ? 14 : undefined,
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
                maxWidth: '150px',
                width: isCompact ? 'auto' : undefined,
                px: isCompact ? 2 : undefined,
                fontSize: isCompact ? 14 : undefined,
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
