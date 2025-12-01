import { useState } from 'react';
import { useSelector } from 'react-redux';
import { get } from 'lodash';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useTherapists } from '../hooks/useTherapists';
import { useGetSubscribedProduct } from '../hooks/useGetSubscribedProduct';
import { useGetTherapistConsultations } from '../hooks/useGetTherapistConsultations';
import type { IExpert, ISlot, IConsultation } from '../patient.interface';
import CustomLoader from '../../../components/loader';
import PatientService from '../patient.service';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useToast } from '../../../providers/toast-provider';

dayjs.extend(utc);
dayjs.extend(timezone);

const BookTherapist = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: therapists, isLoading } = useTherapists(user);
  const { showToast } = useToast();

  const [view, setView] = useState<'list' | 'book'>('list');

  const { data: consultations = [], isLoading: loadingConsultations } =
    useGetTherapistConsultations(user);

  const [selectedTherapistId, setSelectedTherapistId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ISlot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const { data: products } = useGetSubscribedProduct(user);
  const productId = products && products.length > 0 ? products[0].id : null;

  const handleTherapistChange = (event: SelectChangeEvent) => {
    setSelectedTherapistId(event.target.value as string);
    setSlots([]);
    setHasSearched(false);
    setSelectedSlot(null);
  };

  const handleGetSlots = async () => {
    if (selectedTherapistId && selectedDate) {
      setLoadingSlots(true);
      setHasSearched(true);
      setSelectedSlot(null);
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const fetchedSlots = await PatientService.getTherapistSlots(
        user,
        Number(selectedTherapistId),
        dateStr
      );
      setSlots(fetchedSlots);
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
    // Extract time from start string "YYYY-MM-DD HH:mm"
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
      // Optionally switch back to list view
      setView('list');
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">
          {view === 'list' ? 'My Therapist Consultations' : 'Book Therapist'}
        </Typography>
        {view === 'list' ? (
          <Button variant="contained" onClick={() => setView('book')}>
            Add Book Therapist
          </Button>
        ) : (
          <Button variant="outlined" onClick={() => setView('list')}>
            Back to List
          </Button>
        )}
      </Box>

      {view === 'list' ? (
        loadingConsultations ? (
          <CustomLoader />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Therapist Name</TableCell>
                  <TableCell>Booked Slot</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Booking Date</TableCell>
                  <TableCell>Meeting Link</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consultations.length > 0 ? (
                  consultations.map((consultation: IConsultation) => {
                    const userTimezone = get(user, 'time_zone') || 'UTC';
                    const start = dayjs(consultation.event_start)
                      .tz(userTimezone)
                      .format('HH:mm');
                    const end = dayjs(consultation.event_end)
                      .tz(userTimezone)
                      .format('HH:mm');
                    const date = dayjs(consultation.consultation_date)
                      .tz(userTimezone)
                      .format('MMM D, YYYY');

                    let statusLabel = 'Unknown';
                    let statusColor:
                      | 'default'
                      | 'primary'
                      | 'secondary'
                      | 'error'
                      | 'info'
                      | 'success'
                      | 'warning' = 'default';

                    switch (consultation.status) {
                      case 0:
                      case 1:
                        statusLabel = 'Created';
                        statusColor = 'info';
                        break;
                      case 2:
                        statusLabel = 'Pending';
                        statusColor = 'warning';
                        break;
                      case 3:
                        statusLabel = 'Accepted';
                        statusColor = 'success';
                        break;
                      case 4:
                        statusLabel = 'Completed';
                        statusColor = 'success';
                        break;
                      case 5:
                        statusLabel = 'Cancelled';
                        statusColor = 'error';
                        break;
                      case 6:
                        statusLabel = 'Rescheduled';
                        statusColor = 'warning';
                        break;
                      case 7:
                        statusLabel = 'Paid';
                        statusColor = 'success';
                        break;
                      default:
                        statusLabel = `Status ${consultation.status}`;
                    }

                    return (
                      <TableRow key={consultation.id}>
                        <TableCell>{consultation.expert_name}</TableCell>
                        <TableCell>{`${start} - ${end}`}</TableCell>
                        <TableCell>
                          <Chip
                            label={statusLabel}
                            color={statusColor}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{date}</TableCell>
                        <TableCell>
                          {consultation.meet_link ? (
                            <Link
                              href={consultation.meet_link}
                              target="_blank"
                              rel="noopener"
                            >
                              Join Meeting
                            </Link>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No consultations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )
      ) : (
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
            <Typography variant="body1" color="textSecondary">
              No slots available for this date.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default BookTherapist;
