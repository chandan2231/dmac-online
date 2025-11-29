import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import type { IAvailabilitySlot, ISlot } from '../../expert.interface';
import GenericModal from '../../../../components/modal';
import ExpertService from '../../expert.service';
import { useToast } from '../../../../providers/toast-provider';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { get } from 'lodash';

interface UpdateSlotProps {
  open: boolean;
  onClose: () => void;
  slotData: IAvailabilitySlot | null;
  onUpdateSuccess: () => void;
}

const UpdateSlot: React.FC<UpdateSlotProps> = ({
  open,
  onClose,
  slotData,
  onUpdateSuccess,
}) => {
  const [slots, setSlots] = useState<ISlot[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  useEffect(() => {
    if (slotData) {
      setSlots(slotData.slots);
    }
  }, [slotData]);

  if (!slotData) return null;

  const handleSlotToggle = (index: number) => {
    const newSlots = [...slots];
    const slot = newSlots[index];

    // Only allow toggling if not booked
    if (slot.is_booked === 1) return;

    // Toggle between available (1) and unavailable (0)
    slot.is_slot_available = slot.is_slot_available === 1 ? 0 : 1;
    setSlots(newSlots);
  };

  const handleSubmit = async () => {
    const payload = {
      userId: get(user, 'id', ''),
      date: slotData.date,
      slots: slots.map(slot => ({
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_slot_available: slot.is_slot_available,
      })),
    };

    const response = await ExpertService.updateDaySlots(payload);

    if (response.success) {
      showToast(response.message || 'Slots updated successfully', 'success');
      onUpdateSuccess();
      onClose();
    } else {
      showToast(response.message || 'Failed to update slots', 'error');
    }
  };

  return (
    <GenericModal
      isOpen={open}
      onClose={onClose}
      title={`Update Slots for ${slotData.date}`}
      onSubmit={handleSubmit}
      submitButtonText="Save Changes"
      cancelButtonText="Cancel"
      maxWidth="md"
    >
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Click on a slot to toggle its availability. Booked slots cannot be
          changed.
        </Typography>

        <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {slots.map((slot, index) => {
            const label = `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`;
            let color: 'default' | 'error' | 'success' | 'warning' = 'default';
            let variant: 'filled' | 'outlined' = 'filled';
            let disabled = false;

            if (slot.is_booked === 1) {
              color = 'error';
              disabled = true;
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
                onClick={() => !disabled && handleSlotToggle(index)}
                sx={{
                  minWidth: 100,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.7 : 1,
                }}
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
                bgcolor: 'error.main',
              }}
            />
            <Typography variant="caption">Booked (Read-only)</Typography>
          </Box>
        </Box>
      </Box>
    </GenericModal>
  );
};

export default UpdateSlot;
