import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography
} from '@mui/material';
import MorenButton from '../button';

interface ConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    open,
    onClose,
    onConfirm,
    title = '',
    description = 'Do you want to proceed to next test without response?',
    confirmText = 'YES',
    cancelText = 'NO'
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirmation-dialog-title"
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    padding: 2,
                    minWidth: '300px',
                    textAlign: 'center'
                }
            }}
        >
            {title && (
                <DialogTitle id="confirmation-dialog-title" sx={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#274765' }}>
                    {title}
                </DialogTitle>
            )}
            <DialogContent>
                <Typography variant="body1" sx={{ color: 'black', mb: 2, fontSize: '1.5rem', fontWeight: '500' }}>
                    {description}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
                <MorenButton
                    variant="outlined"
                    onClick={onClose}
                    sx={{
                        borderColor: '#274765',
                        color: '#274765',
                        fontWeight: 'bold',
                        minWidth: '100px',
                        '&:hover': {
                            borderColor: '#1e3650',
                            backgroundColor: 'rgba(39, 71, 101, 0.04)'
                        }
                    }}
                >
                    {cancelText}
                </MorenButton>
                <MorenButton
                    variant="contained"
                    onClick={onConfirm}
                    sx={{
                        backgroundColor: '#274765',
                        color: 'white',
                        fontWeight: 'bold',
                        minWidth: '100px',
                        '&:hover': {
                            backgroundColor: '#1e3650'
                        }
                    }}
                >
                    {confirmText}
                </MorenButton>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationModal;
