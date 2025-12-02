import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import type { IAvailabilitySlot } from '../../therapist.interface';
import GenericModal from '../../../../components/modal';

interface ViewSlotDetailsProps {
  open: boolean;
  onClose: () => void;
  slotData: IAvailabilitySlot | null;
}

const ViewSlotDetails: React.FC<ViewSlotDetailsProps> = ({
  open,
  onClose,
  slotData,
}) => {
  if (!slotData) return null;

  return (
    <GenericModal
      isOpen={open}
      onClose={onClose}
      title={`Details for ${slotData.date}`}
      hideSubmitButton
      cancelButtonText="Close"
      maxWidth="xl"
    >
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Day Status:</strong>{' '}
          {slotData.is_day_off === 1 ? (
            <Chip label="Available" color="success" size="small" />
          ) : (
            <Chip label="Day Off" color="default" size="small" />
          )}
        </Typography>

        <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {slotData.slots.map((slot, index) => {
            const label = `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`;
            let color: 'default' | 'error' | 'success' | 'warning' = 'default';
            let variant: 'filled' | 'outlined' = 'filled';

            if (slot.is_day_off === 0) {
              color = 'default';
              variant = 'outlined';
            } else if (slot.is_booked === 1) {
              color = 'error';
            } else if (slot.is_slot_available === 1) {
              color = 'success';
            } else {
              color = 'default';
              variant = 'outlined';
            }

            return (
              <Chip
                key={index}
                label={label}
                color={color}
                variant={variant}
                sx={{ minWidth: 100 }}
              />
            );
          })}
        </Box>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: 'success.main',
              }}
            />
            <Typography variant="caption">Available</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: 'error.main',
              }}
            />
            <Typography variant="caption">Booked</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                border: '1px solid',
                borderColor: 'text.secondary',
              }}
            />
            <Typography variant="caption">Unavailable</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                border: '1px solid',
                borderColor: 'text.secondary',
              }}
            />
            <Typography variant="caption">Day Off</Typography>
          </Box>
        </Box>
      </Box>
    </GenericModal>
  );
};

export default ViewSlotDetails;
