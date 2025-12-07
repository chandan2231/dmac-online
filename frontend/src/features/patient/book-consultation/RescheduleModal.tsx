import { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { get } from 'lodash';
import GenericModal from '../../../components/modal';
import PatientService from '../patient.service';
import { useToast } from '../../../providers/toast-provider';
import type { IExpert, ISlot, IConsultation } from '../patient.interface';
import type { IUser } from '../../auth/auth.interface';

interface RescheduleModalProps {
  open: boolean;
  onClose: () => void;
  consultation: IConsultation | null;
  experts: IExpert[];
  user: IUser | null;
}

const RescheduleModal = ({
  open,
  onClose,
  consultation,
  experts,
  user,
}: RescheduleModalProps) => {
  const { showToast } = useToast();
  const [rescheduleExpertId, setRescheduleExpertId] = useState<string>('');
  const [rescheduleDate, setRescheduleDate] = useState<Dayjs | null>(null);
  const [rescheduleSlots, setRescheduleSlots] = useState<ISlot[]>([]);
  const [rescheduleSelectedSlot, setRescheduleSelectedSlot] =
    useState<ISlot | null>(null);
  const [rescheduleLoadingSlots, setRescheduleLoadingSlots] = useState(false);
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const today = dayjs();
  const maxDate = today.add(6, 'day');

  const handleGetRescheduleSlots = async () => {
    if (rescheduleExpertId && rescheduleDate) {
      setRescheduleLoadingSlots(true);
      setRescheduleSelectedSlot(null);
      setHasSearched(true);
      const dateStr = rescheduleDate.format('YYYY-MM-DD');
      const fetchedSlots = await PatientService.getExpertSlots(
        user,
        Number(rescheduleExpertId),
        dateStr
      );
      setRescheduleSlots(fetchedSlots);
      setRescheduleLoadingSlots(false);
    }
  };

  const handleSubmitReschedule = async () => {
    if (
      !consultation ||
      !rescheduleExpertId ||
      !rescheduleDate ||
      !rescheduleSelectedSlot
    ) {
      showToast('Please select all fields.', 'error');
      return;
    }

    setRescheduleSubmitting(true);
    const dateStr = rescheduleDate.format('YYYY-MM-DD');
    const startTime = rescheduleSelectedSlot.start.split(' ')[1];
    const userTimezone = get(user, 'time_zone') || 'UTC';

    const result = await PatientService.rescheduleConsultation(
      consultation.id,
      dateStr,
      startTime,
      userTimezone
    );

    if (result && result.rescheduled) {
      showToast('Consultation rescheduled successfully!', 'success');
      onClose();
      window.location.reload();
    } else {
      showToast(result?.message || 'Failed to reschedule.', 'error');
    }
    setRescheduleSubmitting(false);
  };

  return (
    <GenericModal
      isOpen={open}
      onClose={onClose}
      title="Reschedule Consultation"
      maxWidth="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="reschedule-expert-select-label">
            Select Expert
          </InputLabel>
          <Select
            labelId="reschedule-expert-select-label"
            id="reschedule-expert-select"
            value={rescheduleExpertId}
            label="Select Expert"
            onChange={e => {
              setRescheduleExpertId(e.target.value as string);
              setRescheduleSlots([]);
              setRescheduleSelectedSlot(null);
              setHasSearched(false);
            }}
          >
            {experts?.map((expert: IExpert) => (
              <MenuItem key={expert.id} value={expert.id}>
                {expert.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DatePicker
          label="Select Date"
          value={rescheduleDate}
          onChange={newValue => {
            setRescheduleDate(newValue);
            setRescheduleSlots([]);
            setRescheduleSelectedSlot(null);
            setHasSearched(false);
          }}
          minDate={today}
          maxDate={maxDate}
          sx={{ width: '100%' }}
        />

        <Button
          variant="contained"
          onClick={handleGetRescheduleSlots}
          disabled={
            !rescheduleExpertId || !rescheduleDate || rescheduleLoadingSlots
          }
        >
          {rescheduleLoadingSlots ? 'Loading...' : 'Get Slots'}
        </Button>

        {rescheduleSlots.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Available Slots:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {rescheduleSlots.map((slot: ISlot) => (
                <Chip
                  key={slot.slot_id}
                  label={`${slot.start.split(' ')[1]} - ${slot.end.split(' ')[1]}`}
                  color={
                    slot.is_booked
                      ? 'default'
                      : rescheduleSelectedSlot?.slot_id === slot.slot_id
                        ? 'secondary'
                        : 'primary'
                  }
                  variant={slot.is_booked ? 'outlined' : 'filled'}
                  disabled={Boolean(slot.is_booked)}
                  onClick={() =>
                    !slot.is_booked && setRescheduleSelectedSlot(slot)
                  }
                  clickable={!slot.is_booked}
                />
              ))}
            </Stack>
          </Box>
        )}

        {hasSearched &&
          rescheduleSlots.length === 0 &&
          !rescheduleLoadingSlots && (
            <Typography variant="body1" color="textSecondary">
              No slots available for this date.
            </Typography>
          )}

        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <Button onClick={onClose} disabled={rescheduleSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitReschedule}
            disabled={!rescheduleSelectedSlot || rescheduleSubmitting}
          >
            {rescheduleSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
          </Button>
        </Box>
      </Box>
    </GenericModal>
  );
};

export default RescheduleModal;
