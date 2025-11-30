import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
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
import { useExperts } from '../hooks/useExperts';
import { useGetSubscribedProduct } from '../hooks/useGetSubscribedProduct';
import type { IExpert, ISlot } from '../patient.interface';
import CustomLoader from '../../../components/loader';
import PatientService from '../patient.service';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useToast } from '../../../providers/toast-provider';

const BookConsultation = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: experts, isLoading } = useExperts(user);
  const { showToast } = useToast();

  const [selectedExpertId, setSelectedExpertId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ISlot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const { data: products } = useGetSubscribedProduct(user);
  const productId = products && products.length > 0 ? products[0].id : null;

  const handleExpertChange = (event: SelectChangeEvent) => {
    setSelectedExpertId(event.target.value as string);
    setSlots([]);
    setHasSearched(false);
    setSelectedSlot(null);
  };

  const handleGetSlots = async () => {
    if (selectedExpertId && selectedDate) {
      setLoadingSlots(true);
      setHasSearched(true);
      setSelectedSlot(null);
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const fetchedSlots = await PatientService.getExpertSlots(
        user,
        Number(selectedExpertId),
        dateStr
      );
      setSlots(fetchedSlots);
      setLoadingSlots(false);
    }
  };

  const handleBookSlot = async () => {
    if (!selectedSlot || !selectedExpertId || !selectedDate || !productId) {
      showToast(
        'Please select a slot and ensure you have a valid subscription.',
        'error'
      );
      return;
    }

    setBookingLoading(true);
    const dateStr = selectedDate.format('YYYY-MM-DD');
    // Extract time from start string "YYYY-MM-DD HH:mm"
    const startTime = selectedSlot.start.split(' ')[1];

    const result = await PatientService.bookConsultation(
      user,
      Number(selectedExpertId),
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
    } else {
      showToast(result?.message || 'Failed to book consultation.', 'error');
    }
    setBookingLoading(false);
  };

  if (isLoading) {
    return <CustomLoader />;
  }

  const today = dayjs();
  const maxDate = today.add(6, 'day');

  return (
    <Box p={3} height="100%" width="100%">
      <Typography variant="h4" gutterBottom>
        Book Consultation
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel id="expert-select-label">Select Consultant</InputLabel>
            <Select
              labelId="expert-select-label"
              id="expert-select"
              value={selectedExpertId}
              label="Select Consultant"
              onChange={handleExpertChange}
            >
              {experts?.map((expert: IExpert) => (
                <MenuItem key={expert.id} value={expert.id}>
                  {expert.name} - {expert.country} ({expert.province_title})
                </MenuItem>
              ))}
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
            disabled={!selectedExpertId || !selectedDate || loadingSlots}
            sx={{
              minWidth: '120px',
            }}
          >
            {loadingSlots ? 'Loading...' : 'Get Slots'}
          </Button>
        </Box>

        {slots.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Available Slots:
            </Typography>
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
          <Typography variant="body1" color="textSecondary">
            No slots available for this date.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default BookConsultation;
