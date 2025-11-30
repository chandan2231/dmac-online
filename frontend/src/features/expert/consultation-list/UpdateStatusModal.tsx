import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';

interface UpdateStatusModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (status: number, notes: string) => void;
  isLoading: boolean;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [status, setStatus] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStatus('');
      setNotes('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (status && notes) {
      onSubmit(status as number, notes);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Consultation Status</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} mt={1}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={e => setStatus(Number(e.target.value))}
            >
              <MenuItem value={4}>Completed</MenuItem>
              <MenuItem value={5}>Cancelled</MenuItem>
              <MenuItem value={6}>Rescheduled</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Consultation Notes"
            multiline
            rows={4}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            required
            fullWidth
            helperText="Please provide detailed notes about the consultation or reason for cancellation/rescheduling."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!status || !notes || isLoading}
        >
          {isLoading ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateStatusModal;
