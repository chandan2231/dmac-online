import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ss[Z]',
  DB_DATE: 'YYYY-MM-DD',
  DB_DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_DATETIME: 'MMM DD, YYYY h:mm A',
  DISPLAY_TIME: 'h:mm A',
};

/**
 * Get the user's local timezone from the browser
 */
export const getUserTimezone = (): string => {
  return dayjs.tz.guess();
};

/**
 * Convert a UTC date string to the user's local timezone
 * @param dateString - UTC date string (ISO or DB format)
 * @param format - Output format (default: DISPLAY_DATETIME)
 */
export const formatToUserLocal = (
  dateString: string | Date,
  format: string = DATE_FORMATS.DISPLAY_DATETIME
): string => {
  if (!dateString) return '';
  return dayjs.utc(dateString).local().format(format);
};

/**
 * Convert a UTC date string to a specific timezone
 * @param dateString - UTC date string
 * @param tz - Target timezone
 * @param format - Output format
 */
export const formatToTimezone = (
  dateString: string | Date,
  tz: string,
  format: string = DATE_FORMATS.DISPLAY_DATETIME
): string => {
  if (!dateString) return '';
  return dayjs.utc(dateString).tz(tz).format(format);
};

/**
 * Convert a local date object or string to UTC string
 * @param date - Local date
 * @param format - Output format (default: ISO)
 */
export const toUTC = (
  date: string | Date,
  format: string = DATE_FORMATS.ISO
): string => {
  if (!date) return '';
  return dayjs(date).utc().format(format);
};

/**
 * Get current date in UTC
 */
export const getNowUTC = (): string => {
  return dayjs.utc().format();
};

/**
 * Format a date string (handling both UTC and local inputs safely)
 * If the input is a simple date (YYYY-MM-DD), it preserves it.
 * If it's a datetime, it converts to local.
 */
export const smartFormatDate = (
  dateString: string,
  format: string = DATE_FORMATS.DISPLAY_DATE
): string => {
  if (!dateString) return '';
  // If it looks like just a date, don't shift timezones
  if (dateString.length === 10 && dateString.includes('-')) {
    return dayjs(dateString).format(format);
  }
  return dayjs.utc(dateString).local().format(format);
};

export default dayjs;
