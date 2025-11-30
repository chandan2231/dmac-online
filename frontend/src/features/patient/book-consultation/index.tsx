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
import type { IExpert, ISlot } from '../patient.interface';
import CustomLoader from '../../../components/loader';
import PatientService from '../patient.service';
import type { SelectChangeEvent } from '@mui/material/Select';

const BookConsultation = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: experts, isLoading } = useExperts(user);

  const [selectedExpertId, setSelectedExpertId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleExpertChange = (event: SelectChangeEvent) => {
    setSelectedExpertId(event.target.value as string);
    setSlots([]);
    setHasSearched(false);
  };

  const handleGetSlots = async () => {
    if (selectedExpertId && selectedDate) {
      setLoadingSlots(true);
      setHasSearched(true);
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
                  color={slot.is_booked ? 'default' : 'primary'}
                  variant={slot.is_booked ? 'outlined' : 'filled'}
                  disabled={Boolean(slot.is_booked)}
                />
              ))}
            </Stack>
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
