import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ModernDatePicker from '../../../components/date-picker';

dayjs.extend(utc);
dayjs.extend(timezone);
import ModernSelect from '../../../components/select';
import type { IOption } from '../../../components/select';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { get } from 'lodash';
import TherapistService from '../therapist.service';
import { useToast } from '../../../providers/toast-provider';
import { useGetTherapistSlots } from '../hooks/useGetTherapistSlots';
import type { ISlotsData } from '../therapist.interface';
import CustomLoader from '../../../components/loader';
import CalendarListing from './calendar-listing';

const isExpired = ({
  therapistSlotsData,
  userTimezone,
}: {
  therapistSlotsData: unknown;
  userTimezone: string;
}) => {
  const slots = get(therapistSlotsData, ['slots'], {}) as ISlotsData;
  const slotKeys = Object.keys(slots).sort();
  const lastDate = slotKeys.length > 0 ? slotKeys[slotKeys.length - 1] : null;

  const isExpired = lastDate
    ? dayjs
        .tz(lastDate, userTimezone)
        .endOf('day')
        .isBefore(dayjs().tz(userTimezone), 'day')
    : true;

  return {
    isExpired,
    slots,
    slotKeys,
  };
};

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  label: `${i.toString().padStart(2, '0')}:00`,
  value: i.toString(),
}));

const Calendar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    data: therapistSlotsData,
    isLoading: isTherapistSlotsLoading,
    refetch,
  } = useGetTherapistSlots({
    therapistId: get(user, ['id']),
  });

  // Get user timezone safely
  const userTimezone = (get(user, ['time_zone'], 'UTC') || 'UTC') as string;

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [shiftStart, setShiftStart] = useState<IOption | null>(null);
  const [shiftEnd, setShiftEnd] = useState<IOption | null>(null);
  const [disabledSlots, setDisabledSlots] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const endDate = useMemo(() => {
    return startDate ? startDate.add(14, 'day') : null;
  }, [startDate]);

  const endOptions = useMemo(() => {
    if (!shiftStart) return HOURS;
    const startHour = parseInt(shiftStart.value, 10);
    return HOURS.map(hour => ({
      ...hour,
      disabled: parseInt(hour.value, 10) <= startHour,
    }));
  }, [shiftStart]);

  const handleSlotToggle = (dateStr: string, hour: number) => {
    const slotId = `${dateStr}-${hour}`;
    setDisabledSlots(prev => {
      const next = new Set(prev);
      if (next.has(slotId)) {
        next.delete(slotId);
      } else {
        next.add(slotId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!startDate || !shiftStart || !shiftEnd) return;

    const startHour = parseInt(shiftStart.value, 10);
    const endHour = parseInt(shiftEnd.value, 10);
    const availability = [];
    const startDateStr = startDate.format('YYYY-MM-DD');

    for (let i = 0; i <= 14; i++) {
      const currentDate = startDate.add(i, 'day');
      const dateStr = currentDate.format('YYYY-MM-DD');
      const daySlots = [];

      for (let h = startHour; h < endHour; h++) {
        const slotId = `${startDateStr}-${h}`;
        daySlots.push({
          hour: h,
          available: !disabledSlots.has(slotId),
        });
      }

      availability.push({
        date: dateStr,
        slots: daySlots,
      });
    }

    const config = {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate?.format('YYYY-MM-DD'),
      shiftStartTime: shiftStart.label,
      shiftEndTime: shiftEnd.label,
      availability,
      userId: get(user, ['id']),
    };

    await TherapistService.setAvailability(config).then(response => {
      if (response.success) {
        showToast(
          response.message || 'Availability saved successfully',
          'success'
        );
        refetch();
      } else {
        showToast(response.message || 'Failed to save availability', 'error');
      }
    });
  };

  const renderSlots = () => {
    if (!startDate || !shiftStart || !shiftEnd) return null;

    const startHour = parseInt(shiftStart.value, 10);
    const endHour = parseInt(shiftEnd.value, 10);

    if (startHour >= endHour) {
      return (
        <Typography color="error">
          Shift end time must be after start time.
        </Typography>
      );
    }

    const currentDate = startDate;
    const dateStr = currentDate.format('YYYY-MM-DD');

    const slots = [];
    for (let h = startHour; h < endHour; h++) {
      const slotId = `${dateStr}-${h}`;
      const isAvailable = !disabledSlots.has(slotId);
      const label = `${h.toString().padStart(2, '0')}:00 - ${(h + 1)
        .toString()
        .padStart(2, '0')}:00`;

      slots.push(
        <Chip
          key={slotId}
          label={label}
          onClick={() => handleSlotToggle(dateStr, h)}
          color={isAvailable ? 'primary' : 'default'}
          variant={isAvailable ? 'filled' : 'outlined'}
          sx={{
            cursor: 'pointer',
            opacity: isAvailable ? 1 : 0.6,
          }}
        />
      );
    }

    return (
      <Box
        key={dateStr}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{slots}</Box>
        <Divider sx={{ mt: 1 }} />
      </Box>
    );
  };

  if (
    isTherapistSlotsLoading ||
    get(therapistSlotsData, ['success']) === false
  ) {
    return <CustomLoader />;
  }

  const {
    isExpired: hasExpired,
    slots: existingSlots,
    slotKeys,
  } = isExpired({ therapistSlotsData, userTimezone });

  if (slotKeys.length > 0 && !hasExpired) {
    return <CalendarListing slotsData={existingSlots} onRefresh={refetch} />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, minWidth: 800, margin: '0 auto' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Set Availability
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Timezone: {userTimezone}
        </Typography>

        <Stack spacing={3}>
          {/* Start Date Selection */}
          <Box>
            <ModernDatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue: Dayjs | null) => setStartDate(newValue)}
              disablePast
              fullWidth
            />
            {endDate && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, color: 'red' }}
              >
                End Date (calculated): {endDate.format('ddd, MMM D, YYYY')}
              </Typography>
            )}
          </Box>

          {/* Shift Time Selection */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <ModernSelect
                label="Shift Start Time"
                options={HOURS}
                value={shiftStart}
                onChange={setShiftStart}
                fullWidth
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <ModernSelect
                label="Shift End Time"
                options={endOptions}
                value={shiftEnd}
                onChange={setShiftEnd}
                fullWidth
              />
            </Box>
          </Box>

          {/* Slots Generation */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Usual Availability
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Click on a slot to mark it as unavailable.
            </Typography>
            {renderSlots()}
          </Box>

          {/* Submit */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={!startDate || !shiftStart || !shiftEnd}
            >
              Save Availability
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Calendar;
