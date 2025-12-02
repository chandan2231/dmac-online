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
import type { SelectChangeEvent } from '@mui/material/Select';
import PatientService from '../patient.service';
import { useToast } from '../../../providers/toast-provider';
import type { IExpert, ISlot } from '../patient.interface';
import { useTherapists } from '../hooks/useTherapists';
import type { IUser } from '../../auth/auth.interface';

interface BookTherapistFormProps {
  user: IUser | null;
  onCancel: () => void;
  onSuccess: () => void;
  productId: number;
}

const BookTherapistForm = ({
  user,
  onCancel,
  onSuccess,
  productId,
}: BookTherapistFormProps) => {
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const { data: therapists, isLoading: loadingTherapists } = useTherapists(
    user,
    selectedDate?.format('YYYY-MM-DD')
  );

  const [selectedTherapistId, setSelectedTherapistId] = useState<string>('');
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ISlot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const today = dayjs();
  const maxDate = today.add(6, 'day');

  const handleTherapistChange = (event: SelectChangeEvent) => {
    setSelectedTherapistId(event.target.value as string);
    setSlots([]);
    setHasSearched(false);
    setSelectedSlot(null);
    setErrorMessage(null);
  };

  const handleGetSlots = async () => {
    if (selectedTherapistId && selectedDate) {
      setLoadingSlots(true);
      setHasSearched(true);
      setSelectedSlot(null);
      setErrorMessage(null);
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const response = await PatientService.getTherapistSlots(
        user,
        Number(selectedTherapistId),
        dateStr
      );

      if (response.status === 400) {
        setErrorMessage(response.message);
        setSlots([]);
      } else {
        setSlots(response.slots || []);
      }
      setLoadingSlots(false);
    }
  };

  const handleBookSlot = async () => {
    if (!selectedSlot || !selectedTherapistId || !selectedDate || !productId) {
      showToast(
        'Please select a slot and ensure you have a valid subscription.',
        'error'
      );
      return;
    }

    setBookingLoading(true);
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const startTime = selectedSlot.start.split(' ')[1];

    const result = await PatientService.bookTherapistConsultation(
      user,
      Number(selectedTherapistId),
      dateStr,
      startTime,
      productId
    );

    if (result && result.booked) {
      showToast('Consultation booked successfully!', 'success');
      setSlots(prev =>
        prev.map(s =>
          s.slot_id === selectedSlot.slot_id ? { ...s, is_booked: 1 } : s
        )
      );
      setSelectedSlot(null);
      onSuccess();
    } else {
      showToast(result?.message || 'Failed to book consultation.', 'error');
    }
    setBookingLoading(false);
  };

  return (
    <Box p={3} height="100%" width="100%">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Book Therapist</Typography>
        <Button variant="outlined" onClick={onCancel}>
          Back to List
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel id="therapist-select-label">
              Select Therapist
            </InputLabel>
            <Select
              labelId="therapist-select-label"
              id="therapist-select"
              value={selectedTherapistId}
              label="Select Therapist"
              onChange={handleTherapistChange}
              disabled={loadingTherapists}
            >
              {loadingTherapists ? (
                <MenuItem disabled value="">
                  Loading...
                </MenuItem>
              ) : (
                therapists?.map((therapist: IExpert) => (
                  <MenuItem key={therapist.id} value={therapist.id}>
                    {therapist.name} - {therapist.country} (
                    {therapist.province_title})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={newValue => {
              setSelectedDate(newValue);
              setSlots([]);
              setHasSearched(false);
            }}
            minDate={today}
            maxDate={maxDate}
            sx={{ flex: 1 }}
          />

          <Button
            variant="contained"
            onClick={handleGetSlots}
            disabled={!selectedTherapistId || !selectedDate || loadingSlots}
            sx={{
              minWidth: '120px',
            }}
          >
            {loadingSlots ? 'Loading...' : 'Get Slots'}
          </Button>
        </Box>

        {slots.length > 0 && (
          <Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Typography variant="h6" mb={0}>
                Available Slots:
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Timezone: {get(user, 'time_zone', 'UTC')}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {slots.map((slot: ISlot) => (
                <Chip
                  key={slot.slot_id}
                  label={`${slot.start.split(' ')[1]} - ${slot.end.split(' ')[1]}`}
                  color={
                    slot.is_booked
                      ? 'default'
                      : selectedSlot?.slot_id === slot.slot_id
                        ? 'secondary'
                        : 'primary'
                  }
                  variant={slot.is_booked ? 'outlined' : 'filled'}
                  disabled={Boolean(slot.is_booked)}
                  onClick={() => !slot.is_booked && setSelectedSlot(slot)}
                  clickable={!slot.is_booked}
                />
              ))}
            </Stack>
            {selectedSlot && (
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleBookSlot}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Booking...' : 'Book Selected Slot'}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {hasSearched && slots.length === 0 && !loadingSlots && (
          <Typography
            variant="body1"
            color={errorMessage ? 'error' : 'textSecondary'}
          >
            {errorMessage || 'No slots available for this date.'}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default BookTherapistForm;
