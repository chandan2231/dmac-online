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
  Link,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useExperts } from '../hooks/useExperts';

dayjs.extend(utc);
dayjs.extend(timezone);
import { useGetSubscribedProduct } from '../hooks/useGetSubscribedProduct';
import { useGetConsultations } from '../hooks/useGetConsultations';
import type { IExpert, ISlot, IConsultation } from '../patient.interface';
import CustomLoader from '../../../components/loader';
import PatientService from '../patient.service';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useToast } from '../../../providers/toast-provider';
import { GenericTable } from '../../../components/table';
import SubscriptionRequired from '../../../components/subscription-required';
import type { GridColDef } from '@mui/x-data-grid';

const BookConsultation = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: experts, isLoading } = useExperts(user);
  const { showToast } = useToast();

  const [view, setView] = useState<'list' | 'book'>('list');
  const { data: consultations = [], isLoading: loadingConsultations } =
    useGetConsultations(user);

  const isAddDisabled = consultations.some((c: IConsultation) =>
    [0, 1, 2, 3, 4].includes(c.status)
  );

  const [selectedExpertId, setSelectedExpertId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ISlot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const { data: products, isLoading: loadingProducts } =
    useGetSubscribedProduct(user);
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
      // Optionally switch back to list view
      setView('list');
    } else {
      showToast(result?.message || 'Failed to book consultation.', 'error');
    }
    setBookingLoading(false);
  };

  const columns: GridColDef[] = [
    { field: 'expert_name', headerName: 'Expert Name', flex: 1 },
    {
      field: 'booked_slot',
      headerName: 'Booked Slot',
      flex: 1,
      renderCell: params => {
        const userTimezone = get(user, 'time_zone') || 'UTC';
        const start = dayjs(params.row.event_start)
          .tz(userTimezone)
          .format('HH:mm');
        const end = dayjs(params.row.event_end)
          .tz(userTimezone)
          .format('HH:mm');
        return `${start} - ${end}`;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: params => {
        let statusLabel = 'Unknown';
        let statusColor:
          | 'default'
          | 'primary'
          | 'secondary'
          | 'error'
          | 'info'
          | 'success'
          | 'warning' = 'default';

        switch (params.value) {
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
            statusLabel = `Status ${params.value}`;
        }
        return <Chip label={statusLabel} color={statusColor} size="small" />;
      },
    },
    {
      field: 'consultation_date',
      headerName: 'Booking Date',
      flex: 1,
      renderCell: params => {
        const userTimezone = get(user, 'time_zone') || 'UTC';
        return dayjs(params.value).tz(userTimezone).format('MMM D, YYYY');
      },
    },
    {
      field: 'meet_link',
      headerName: 'Meeting Link',
      flex: 1,
      renderCell: params => {
        return params.value ? (
          <Link href={params.value} target="_blank" rel="noopener">
            Join Meeting
          </Link>
        ) : (
          'N/A'
        );
      },
    },
  ];

  if (isLoading || loadingProducts) {
    return <CustomLoader />;
  }

  if (!productId) {
    return (
      <Box p={3} height="100%" width="100%">
        <SubscriptionRequired
          title="Subscription Required"
          description="You need to purchase a subscription to book a consultation or view your history."
        />
      </Box>
    );
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
        <Typography variant="h5">
          {view === 'list' ? 'My Consultations' : 'Book Consultation'}
        </Typography>
        {view === 'list' ? (
          <Button
            variant="contained"
            onClick={() => setView('book')}
            disabled={isAddDisabled}
          >
            Add Book Consultation
          </Button>
        ) : (
          <Button variant="outlined" onClick={() => setView('list')}>
            Back to List
          </Button>
        )}
      </Box>

      {view === 'list' ? (
        <GenericTable
          rows={consultations}
          columns={columns}
          loading={loadingConsultations}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel id="expert-select-label">
                Select Consultant
              </InputLabel>
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

export default BookConsultation;
