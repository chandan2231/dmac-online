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
import type { SxProps, Theme } from '@mui/material/styles';
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
    position: 'relative',
  },
}));

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  title?: string;
  titleSx?: SxProps<Theme>;
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
  titleSx,
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
  const isInstructionModal = Boolean(enableAudio && instructionText && hideCancelButton && onSubmit);

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
      {title ? (
        <DialogTitle
          id="generic-modal-title"
          sx={{
            m: 0,
            p: isCompact ? 1.5 : 2,
            pr: !hideCloseIcon ? (isCompact ? 5.5 : 6) : undefined,
            fontSize: isCompact ? '1.125rem' : '1.5rem',
            backgroundColor: theme => theme.palette.primary.main,
            color: theme => theme.palette.common.white,
            position: 'relative',
            ...titleSx,
          }}
        >
          {title}

          {!hideCloseIcon && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                color: theme => theme.palette.common.white,
                backgroundColor: theme => theme.palette.grey[700],
                width: { xs: 24, sm: 26, md: 28 },
                height: { xs: 24, sm: 26, md: 28 },
                p: 0,
                zIndex: 2,
                '&:hover': {
                  backgroundColor: theme => theme.palette.grey[900],
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </DialogTitle>
      ) : null}

      {!hideCloseIcon && !title && (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            color: theme => theme.palette.common.white,
            backgroundColor: theme => theme.palette.grey[700],
            width: { xs: 24, sm: 26, md: 28 },
            height: { xs: 24, sm: 26, md: 28 },
            p: 0,
            zIndex: 2,
            '&:hover': {
              backgroundColor: theme => theme.palette.grey[900],
            },
          }}
        >
          <CloseIcon fontSize="small" />
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
        <DialogContent
          sx={
            isInstructionModal
              ? {
                  ...(isCompact ? { py: 1.5 } : undefined),
                  pt: '15px !important',
                  '& .MuiTypography-root': {
                    fontSize: '18px',
                    fontWeight: 600,
                    lineHeight: 1.6,
                    color: 'black',
                  },
                }
              : isCompact
                ? { py: 1.5, ...(title ? { pt: '15px' } : undefined) }
                : undefined
          }
        >
          {subTitle && (
            <Typography
              variant="h6"
              sx={{
                textAlign: 'left',
                fontSize: { xs: '0.875rem', sm: '0.875rem', md: '1rem' },
                fontWeight: 'bold',
                mb: 1,
                mt: 1,
              }}
            >
              {subTitle}
            </Typography>
          )}

          {children}
        </DialogContent>
      ) : null}

      {(onSubmit || !hideCancelButton) && (
        <DialogActions
          disableSpacing
          sx={{
            ...(isInstructionModal
              ? {
                  display: { xs: 'flex', sm: 'grid' },
                  gridTemplateColumns: { sm: '1fr 1fr 1fr' },
                  alignItems: 'center',
                  justifyContent: { xs: 'center', sm: 'stretch' },
                  flexDirection: { xs: 'column', sm: 'initial' },
                  width: '100%',
                  gap: 1,
                  rowGap: 1,
                  '& > :not(style)': {
                    margin: 0,
                  },
                }
              : {
                  justifyContent: 'flex-end',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 1,
                  '& > :not(style)': {
                    margin: 0,
                  },
                }),
          }}
        >
          {enableAudio && instructionText && (
            <Box
              sx={{
                marginRight:
                  audioButtonAlignment === 'left'
                    ? 'auto'
                    : audioButtonAlignment === 'center'
                      ? 'auto'
                      : 0,
                marginLeft: audioButtonAlignment === 'center' ? 'auto' : 0,
                ...(isInstructionModal
                  ? {
                      gridColumn: { sm: '2' },
                      justifySelf: { sm: 'center' },
                      width: '100%',
                      maxWidth: { xs: 360, sm: 360 },
                      mx: 'auto',
                    }
                  : {
                      width: 'auto',
                    }),
                '& .MuiButton-root': {
                  width: isInstructionModal ? '100%' : undefined,
                  maxWidth: isInstructionModal ? '100%' : undefined,
                  whiteSpace: 'normal',
                  height: isInstructionModal ? 'auto' : undefined,
                  minHeight: isInstructionModal ? 48 : undefined,
                  textAlign: 'center',
                },
              }}
            >
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
                maxWidth: isInstructionModal ? { xs: '100%', sm: '150px' } : '150px',
                width: isInstructionModal ? { xs: '100%', sm: isCompact ? 'auto' : undefined } : isCompact ? 'auto' : undefined,
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
                ...(isInstructionModal
                  ? {
                      gridColumn: { sm: '3' },
                      justifySelf: { sm: 'end' },
                      width: '100%',
                      maxWidth: 360,
                      mx: 'auto',
                      height: 'auto',
                      minHeight: 48,
                    }
                  : {
                      maxWidth: '150px',
                      width: isCompact ? 'auto' : undefined,
                    }),
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
