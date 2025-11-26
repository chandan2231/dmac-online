import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

// --- Mock Data ---

// 1. Host Configuration (User B)
export const HOST_CONFIG = {
  id: 'user-b',
  name: 'Dr. Tanaka (Host)',
  timezone: 'Asia/Tokyo', // Host is in Tokyo
  workingHours: {
    start: '09:00', // 9 AM Tokyo Time
    end: '17:00', // 5 PM Tokyo Time
  },
  workDays: [1, 2, 3, 4, 5], // Mon-Fri
};

// 2. Existing Meetings (Stored in UTC in DB)
// Let's generate some mock meetings relative to "today" to ensure they appear
const today = dayjs();

export const MOCK_MEETINGS = [
  {
    id: 1,
    title: 'Existing Client Call',
    // 10:00 AM - 11:00 AM Tokyo Time (approx 1:00 AM UTC)
    start: today.tz('Asia/Tokyo').hour(10).minute(0).second(0).utc().format(),
    end: today.tz('Asia/Tokyo').hour(11).minute(0).second(0).utc().format(),
  },
  {
    id: 2,
    title: 'Lunch Break',
    // 12:00 PM - 1:00 PM Tokyo Time
    start: today.tz('Asia/Tokyo').hour(12).minute(0).second(0).utc().format(),
    end: today.tz('Asia/Tokyo').hour(13).minute(0).second(0).utc().format(),
  },
];

// --- Logic ---

export interface TimeSlot {
  start: string; // UTC ISO string
  end: string; // UTC ISO string
}

/**
 * Generates available 1-hour slots for a specific date.
 *
 * @param dateStr - The date to check (YYYY-MM-DD)
 * @param viewerTimezone - The timezone of the person viewing (User A)
 * @returns Array of available slots in UTC
 */
export const getAvailableSlots = (dateStr: string): TimeSlot[] => {
  const hostTz = HOST_CONFIG.timezone;

  // 1. Parse the requested date in HOST's timezone
  // We want to find slots for "2023-11-27" in Tokyo time
  const dayStart = dayjs.tz(dateStr, hostTz).startOf('day');

  // Check if host works on this day of week
  const dayOfWeek = dayStart.day(); // 0=Sun, 1=Mon...
  if (!HOST_CONFIG.workDays.includes(dayOfWeek)) {
    return [];
  }

  // 2. Define Work Hours in Host's Timezone
  const [startHour, startMinute] = HOST_CONFIG.workingHours.start
    .split(':')
    .map(Number);
  const [endHour, endMinute] = HOST_CONFIG.workingHours.end
    .split(':')
    .map(Number);

  const workStart = dayStart.hour(startHour).minute(startMinute);
  const workEnd = dayStart.hour(endHour).minute(endMinute);

  // 3. Generate 1-hour slots
  const slots: TimeSlot[] = [];
  let currentSlot = workStart;

  while (
    currentSlot.add(1, 'hour').isBefore(workEnd) ||
    currentSlot.add(1, 'hour').isSame(workEnd)
  ) {
    const slotStartUTC = currentSlot.utc();
    const slotEndUTC = currentSlot.add(1, 'hour').utc();

    // 4. Check collision with existing meetings
    const isBusy = MOCK_MEETINGS.some(meeting => {
      const mStart = dayjs.utc(meeting.start);
      const mEnd = dayjs.utc(meeting.end);

      // Check for overlap
      // (StartA < EndB) and (EndA > StartB)
      return slotStartUTC.isBefore(mEnd) && slotEndUTC.isAfter(mStart);
    });

    if (!isBusy) {
      slots.push({
        start: slotStartUTC.format(),
        end: slotEndUTC.format(),
      });
    }

    currentSlot = currentSlot.add(1, 'hour');
  }

  return slots;
};
