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
  Rating,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { get } from 'lodash';
import type { SelectChangeEvent } from '@mui/material/Select';
import PatientService from '../patient.service';
import { useToast } from '../../../providers/toast-provider';
import type { IExpert, ISlot } from '../patient.interface';
import type { IUser } from '../../auth/auth.interface';
import CustomLoader from '../../../components/loader';

interface BookConsultationFormProps {
  experts: IExpert[];
  user: IUser | null;
  onCancel: () => void;
  onSuccess: () => void;
  productId: number;
}

const BookConsultationForm = ({
  experts,
  user,
  onCancel,
  onSuccess,
  productId,
}: BookConsultationFormProps) => {
  const { showToast } = useToast();
  const [selectedExpertId, setSelectedExpertId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ISlot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const today = dayjs();
  const maxDate = today.add(6, 'day');

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
    const startTime = selectedSlot.start.split(' ')[1];

    const result = await PatientService.bookConsultation(
      user,
      Number(selectedExpertId),
      dateStr,
      startTime,
      productId
    );

    if (result && result.booked) {
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

  const selectedExpert = experts?.find(e => e.id === Number(selectedExpertId));

  if (bookingLoading) {
    return <CustomLoader />;
  }

  return (
    <Box p={3} height="100%" width="100%">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Book Consultation</Typography>
        <Button variant="outlined" onClick={onCancel}>
          Back to List
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box
          sx={{ display: 'flex', gap: 2 }}
          flexDirection={{
            xs: 'column',
            sm: 'column',
            md: 'row',
          }}
        >
          <FormControl sx={{ flex: 1 }}>
            <InputLabel id="expert-select-label">Select Consultant</InputLabel>
            <Select
              labelId="expert-select-label"
              id="expert-select"
              value={selectedExpertId}
              label="Select Consultant"
              onChange={handleExpertChange}
              renderValue={selected => {
                const expert = experts.find(e => e.id === Number(selected));
                return expert
                  ? `${expert.name} - ${expert.country} (${expert.province_title})`
                  : '';
              }}
            >
              {experts?.map((expert: IExpert) => (
                <MenuItem key={expert.id} value={expert.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2">
                      {expert.name} - {expert.country} ({expert.province_title})
                    </Typography>
                    {expert.average_rating ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          ml: 2,
                        }}
                      >
                        <Rating
                          value={Number(expert.average_rating)}
                          readOnly
                          size="small"
                          precision={0.5}
                        />
                      </Box>
                    ) : (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 2 }}
                      >
                        No reviews available
                      </Typography>
                    )}
                  </Box>
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

        {selectedExpert && (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle2">Average Rating:</Typography>
            {selectedExpert.average_rating ? (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Rating
                  value={Number(selectedExpert.average_rating)}
                  readOnly
                  size="small"
                  precision={0.5}
                />
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary">
                No reviews available
              </Typography>
            )}
          </Box>
        )}

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
          <Typography variant="body1" color="textSecondary">
            No slots available for this date.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default BookConsultationForm;
