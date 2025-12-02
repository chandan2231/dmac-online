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
  therapists: IExpert[];
  user: IUser | null;
}

const RescheduleModal = ({
  open,
  onClose,
  consultation,
  therapists,
  user,
}: RescheduleModalProps) => {
  const { showToast } = useToast();
  const [rescheduleTherapistId, setRescheduleTherapistId] =
    useState<string>('');
  const [rescheduleDate, setRescheduleDate] = useState<Dayjs | null>(null);
  const [rescheduleSlots, setRescheduleSlots] = useState<ISlot[]>([]);
  const [rescheduleSelectedSlot, setRescheduleSelectedSlot] =
    useState<ISlot | null>(null);
  const [rescheduleLoadingSlots, setRescheduleLoadingSlots] = useState(false);
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);

  const today = dayjs();
  const maxDate = today.add(6, 'day');

  const handleGetRescheduleSlots = async () => {
    if (rescheduleTherapistId && rescheduleDate) {
      setRescheduleLoadingSlots(true);
      setRescheduleSelectedSlot(null);
      const dateStr = rescheduleDate.format('YYYY-MM-DD');
      const response = await PatientService.getTherapistSlots(
        user,
        Number(rescheduleTherapistId),
        dateStr
      );

      if (response.status === 400) {
        showToast(response.message, 'error');
        setRescheduleSlots([]);
      } else {
        setRescheduleSlots(response.slots || []);
      }
      setRescheduleLoadingSlots(false);
    }
  };

  const handleSubmitReschedule = async () => {
    if (
      !consultation ||
      !rescheduleTherapistId ||
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

    const result = await PatientService.rescheduleTherapistConsultation(
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
      maxWidth="xl"
      onSubmit={handleSubmitReschedule}
      submitButtonText={rescheduleSubmitting ? 'Rescheduling...' : 'Confirm'}
      cancelButtonText="Cancel"
      submitDisabled={!rescheduleSelectedSlot || rescheduleSubmitting}
    >
      <Box display="flex" flexDirection="column" gap={3} mt={1}>
        <FormControl fullWidth>
          <InputLabel id="reschedule-therapist-label">
            Select Therapist
          </InputLabel>
          <Select
            labelId="reschedule-therapist-label"
            value={rescheduleTherapistId}
            label="Select Therapist"
            onChange={e => {
              setRescheduleTherapistId(e.target.value as string);
              setRescheduleSlots([]);
              setRescheduleSelectedSlot(null);
            }}
          >
            {therapists?.map((therapist: IExpert) => (
              <MenuItem key={therapist.id} value={therapist.id}>
                {therapist.name} - {therapist.country} (
                {therapist.province_title})
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
          }}
          minDate={today}
          maxDate={maxDate}
        />

        <Button
          variant="contained"
          onClick={handleGetRescheduleSlots}
          disabled={
            !rescheduleTherapistId || !rescheduleDate || rescheduleLoadingSlots
          }
        >
          {rescheduleLoadingSlots ? 'Loading Slots...' : 'Get Slots'}
        </Button>

        {rescheduleSlots.length > 0 && (
          <Box>
            <Typography variant="subtitle1" mb={1}>
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

        {rescheduleSlots.length === 0 &&
          rescheduleDate &&
          !rescheduleLoadingSlots && (
            <Typography variant="body2" color="textSecondary">
              No slots available.
            </Typography>
          )}
      </Box>
    </GenericModal>
  );
};

export default RescheduleModal;
