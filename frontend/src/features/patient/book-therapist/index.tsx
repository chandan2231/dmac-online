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
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const { data: therapists, isLoading } = useTherapists(
    user,
    selectedDate?.format('YYYY-MM-DD')
  );
  const { showToast } = useToast();

  const [view, setView] = useState<'list' | 'book'>('list');

  const { data: consultations = [], isLoading: loadingConsultations } =
    useGetTherapistConsultations(user);

  const isAddDisabled = consultations.some((c: IConsultation) =>
    [0, 1, 2, 3, 4].includes(c.status)
  );

  const [selectedTherapistId, setSelectedTherapistId] = useState<string>('');
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ISlot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reschedule State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConsultation, setSelectedConsultation] =
    useState<IConsultation | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleTherapistId, setRescheduleTherapistId] =
    useState<string>('');
  const [rescheduleDate, setRescheduleDate] = useState<Dayjs | null>(null);
  const [rescheduleSlots, setRescheduleSlots] = useState<ISlot[]>([]);
  const [rescheduleSelectedSlot, setRescheduleSelectedSlot] =
    useState<ISlot | null>(null);
  const [rescheduleLoadingSlots, setRescheduleLoadingSlots] = useState(false);
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);

  const { data: products } = useGetSubscribedProduct(user);
  const productId = products && products.length > 0 ? products[0].id : null;

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    consultation: IConsultation
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedConsultation(consultation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedConsultation(null);
  };

  const handleRescheduleClick = () => {
    setAnchorEl(null);
    if (selectedConsultation) {
      setRescheduleModalOpen(true);
      // Pre-fill therapist if possible, or let user select
      // Assuming we want to allow changing therapist, we start empty or with current one
      // But the requirement says "Therapist selection dropdown", so we let them choose.
      // We can pre-select the current therapist if we have their ID, but IConsultation might not have it directly or it might be expert_id?
      // Let's check IConsultation interface. It has expert_name.
      // We'll leave it empty for now or try to match if we had the ID.
      setRescheduleTherapistId('');
      setRescheduleDate(null);
      setRescheduleSlots([]);
      setRescheduleSelectedSlot(null);
    }
  };

  const handleRescheduleClose = () => {
    setRescheduleModalOpen(false);
    setRescheduleTherapistId('');
    setRescheduleDate(null);
    setRescheduleSlots([]);
    setRescheduleSelectedSlot(null);
  };

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
      !selectedConsultation ||
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
      selectedConsultation.id,
      dateStr,
      startTime,
      userTimezone
    );

    if (result && result.rescheduled) {
      showToast('Consultation rescheduled successfully!', 'success');
      handleRescheduleClose();
      // Ideally refresh the list here. Since we use react-query, we might need to invalidate queries.
      // But for now, the list might not auto-update unless we refetch.
      // We can force a reload or use queryClient if available.
      // Assuming the parent or hook handles refetch on focus or we can just wait for next fetch.
      // Or we can manually update the local state if we were managing it locally, but it's from a hook.
      // A simple way is to reload the page or let react-query handle it if configured.
      window.location.reload(); // Simple fallback
    } else {
      showToast(result?.message || 'Failed to reschedule.', 'error');
    }
    setRescheduleSubmitting(false);
  };

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
        {view === 'list' && consultations.length === 0 ? (
          <Button
            variant="contained"
            onClick={() => setView('book')}
            disabled={isAddDisabled}
          >
            Add Book Therapist
          </Button>
        ) : view === 'book' ? (
          <Button variant="outlined" onClick={() => setView('list')}>
            Back to List
          </Button>
        ) : null}
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
                  <TableCell>Action</TableCell>
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
                        <TableCell>
                          <IconButton
                            onClick={e => handleMenuOpen(e, consultation)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No consultations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {selectedConsultation &&
                [5, 6].includes(selectedConsultation.status) && (
                  <MenuItem onClick={handleRescheduleClick}>
                    Reschedule Booking
                  </MenuItem>
                )}
            </Menu>
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
            <Typography
              variant="body1"
              color={errorMessage ? 'error' : 'textSecondary'}
            >
              {errorMessage || 'No slots available for this date.'}
            </Typography>
          )}
        </Box>
      )}

      {/* Reschedule Modal */}
      <Dialog
        open={rescheduleModalOpen}
        onClose={handleRescheduleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Reschedule Consultation</DialogTitle>
        <DialogContent>
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
                !rescheduleTherapistId ||
                !rescheduleDate ||
                rescheduleLoadingSlots
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRescheduleClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReschedule}
            variant="contained"
            color="primary"
            disabled={!rescheduleSelectedSlot || rescheduleSubmitting}
          >
            {rescheduleSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookTherapist;
