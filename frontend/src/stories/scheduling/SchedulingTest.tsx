import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  HOST_CONFIG as DEFAULT_HOST_CONFIG,
  getAvailableSlots as defaultGetAvailableSlots,
} from './mockData';
import type { TimeSlot } from './mockData';

dayjs.extend(utc);
dayjs.extend(timezone);

interface SchedulingTestProps {
  hostConfig?: typeof DEFAULT_HOST_CONFIG;
  getSlots?: (dateStr: string) => TimeSlot[];
}

const SchedulingTest = ({
  hostConfig = DEFAULT_HOST_CONFIG,
  getSlots = defaultGetAvailableSlots,
}: SchedulingTestProps) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [userTimezone, setUserTimezone] = useState('');

  useEffect(() => {
    // Detect User's Timezone (User A)
    const tz = dayjs.tz.guess();
    setUserTimezone(tz);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      // Fetch slots for the selected date
      // Note: We pass the date string YYYY-MM-DD
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const slots = getSlots(dateStr);
      setAvailableSlots(slots);
      setSelectedSlot(null); // Reset selection
    }
  }, [selectedDate, getSlots]);

  const handleBook = () => {
    if (!selectedSlot) return;
    console.log('Booking Confirmed:', {
      slotUTC: selectedSlot,
      host: hostConfig.id,
      userTimezone: userTimezone,
    });
    alert(
      `Booking Request Sent!\n\nTime (UTC): ${selectedSlot.start}\nYour Time: ${dayjs(selectedSlot.start).tz(userTimezone).format('LLL')}`
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 4, maxWidth: 1200, margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom>
          Cross-Timezone Scheduling Test
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Scenario:</strong> You (User A) are in{' '}
          <strong>{userTimezone}</strong>. You are booking a meeting with{' '}
          <strong>{hostConfig.name}</strong> who is in{' '}
          <strong>{hostConfig.timezone}</strong>.
          <br />
          Host works Mon-Fri, {hostConfig.workingHours.start} -{' '}
          {hostConfig.workingHours.end} ({hostConfig.timezone} Time).
        </Alert>

        <Grid container spacing={4}>
          {/* Left Column: Calendar */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Select Date
              </Typography>
              <DateCalendar
                value={selectedDate}
                onChange={newValue => setSelectedDate(newValue)}
                disablePast
              />
            </Paper>
          </Grid>

          {/* Right Column: Slots */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={3} sx={{ p: 3, minHeight: 400 }}>
              <Typography variant="h6" gutterBottom>
                Available Slots ({dayjs(selectedDate).format('MMM D, YYYY')})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Times shown in your local time ({userTimezone})
              </Typography>

              <Divider sx={{ my: 2 }} />

              {availableSlots.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No slots available for this date. (Host might be off-work or
                    fully booked)
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {availableSlots.map((slot, index) => {
                    // Convert UTC slot to User's Local Time for display
                    const localStart = dayjs(slot.start).tz(userTimezone);

                    const isSelected = selectedSlot?.start === slot.start;

                    return (
                      <Grid size={{ xs: 4, sm: 3 }} key={index}>
                        <Chip
                          label={localStart.format('h:mm A')}
                          onClick={() => setSelectedSlot(slot)}
                          color={isSelected ? 'primary' : 'default'}
                          variant={isSelected ? 'filled' : 'outlined'}
                          sx={{ width: '100%', cursor: 'pointer' }}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              )}

              {selectedSlot && (
                <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Confirm Booking
                  </Typography>
                  <Typography variant="body2">
                    <strong>Your Time:</strong>{' '}
                    {dayjs(selectedSlot.start).tz(userTimezone).format('LLLL')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Host Time:</strong>{' '}
                    {dayjs(selectedSlot.start)
                      .tz(hostConfig.timezone)
                      .format('LLLL')}
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 1, fontFamily: 'monospace' }}
                  >
                    UTC: {selectedSlot.start}
                  </Typography>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleBook}
                  >
                    Book Meeting
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default SchedulingTest;
