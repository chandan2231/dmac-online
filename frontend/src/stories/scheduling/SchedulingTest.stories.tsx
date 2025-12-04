import type { Meta, StoryObj } from '@storybook/react-vite';
import SchedulingTest from './SchedulingTest';
import { HOST_CONFIG as DEFAULT_HOST_CONFIG, MOCK_MEETINGS } from './mockData';
import type { TimeSlot } from './mockData';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const meta: Meta<typeof SchedulingTest> = {
  title: 'Scheduling/SchedulingTest',
  component: SchedulingTest,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SchedulingTest>;

// Helper to generate slots dynamically based on config
const createGetSlots =
  (config: typeof DEFAULT_HOST_CONFIG) =>
  (dateStr: string): TimeSlot[] => {
    const hostTz = config.timezone;
    const dayStart = dayjs.tz(dateStr, hostTz).startOf('day');

    const dayOfWeek = dayStart.day();
    if (!config.workDays.includes(dayOfWeek)) {
      return [];
    }

    const [startHour, startMinute] = config.workingHours.start
      .split(':')
      .map(Number);
    const [endHour, endMinute] = config.workingHours.end.split(':').map(Number);

    const workStart = dayStart.hour(startHour).minute(startMinute);
    const workEnd = dayStart.hour(endHour).minute(endMinute);

    const slots: TimeSlot[] = [];
    let currentSlot = workStart;

    while (
      currentSlot.add(1, 'hour').isBefore(workEnd) ||
      currentSlot.add(1, 'hour').isSame(workEnd)
    ) {
      const slotStartUTC = currentSlot.utc();
      const slotEndUTC = currentSlot.add(1, 'hour').utc();

      // Check against mock meetings (in UTC)
      const isBusy = MOCK_MEETINGS.some(meeting => {
        const mStart = dayjs.utc(meeting.start);
        const mEnd = dayjs.utc(meeting.end);
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

export const DefaultTokyoHost: Story = {
  args: {
    hostConfig: DEFAULT_HOST_CONFIG,
    getSlots: createGetSlots(DEFAULT_HOST_CONFIG),
  },
};

export const NewYorkHost: Story = {
  args: {
    hostConfig: {
      id: 'user-ny',
      name: 'Dr. Smith (NY)',
      timezone: 'America/New_York',
      workingHours: { start: '09:00', end: '17:00' },
      workDays: [1, 2, 3, 4, 5],
    },
    getSlots: createGetSlots({
      id: 'user-ny',
      name: 'Dr. Smith (NY)',
      timezone: 'America/New_York',
      workingHours: { start: '09:00', end: '17:00' },
      workDays: [1, 2, 3, 4, 5],
    }),
  },
};

export const LondonHost: Story = {
  args: {
    hostConfig: {
      id: 'user-uk',
      name: 'Dr. Watson (London)',
      timezone: 'Europe/London',
      workingHours: { start: '10:00', end: '18:00' },
      workDays: [1, 2, 3, 4, 5],
    },
    getSlots: createGetSlots({
      id: 'user-uk',
      name: 'Dr. Watson (London)',
      timezone: 'Europe/London',
      workingHours: { start: '10:00', end: '18:00' },
      workDays: [1, 2, 3, 4, 5],
    }),
  },
};

export const SydneyHost: Story = {
  args: {
    hostConfig: {
      id: 'user-au',
      name: 'Dr. Jones (Sydney)',
      timezone: 'Australia/Sydney',
      workingHours: { start: '08:00', end: '16:00' },
      workDays: [1, 2, 3, 4, 5],
    },
    getSlots: createGetSlots({
      id: 'user-au',
      name: 'Dr. Jones (Sydney)',
      timezone: 'Australia/Sydney',
      workingHours: { start: '08:00', end: '16:00' },
      workDays: [1, 2, 3, 4, 5],
    }),
  },
};
