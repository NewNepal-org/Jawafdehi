/**
 * Date formatting utilities with Kathmandu timezone support
 * All dates on the website should be displayed in Kathmandu timezone (Asia/Kathmandu, GMT+5:45)
 */

import { format, parseISO, isSameDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import DateConverter from '@remotemerge/nepali-date-converter';

const KATHMANDU_TIMEZONE = 'Asia/Kathmandu';

// Nepali month names
const NEPALI_MONTHS = [
  'बैशाख', 'जेष्ठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
  'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
];

// Nepali numerals mapping
const NEPALI_NUMERALS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/**
 * Convert a number to Nepali numerals
 * @param num - Number to convert
 * @returns String with Nepali numerals
 */
function toNepaliNumerals(num: number): string {
  return String(num)
    .split('')
    .map((digit) => NEPALI_NUMERALS[parseInt(digit, 10)] || digit)
    .join('');
}

/**
 * Format a date string to display in Kathmandu timezone
 * @param dateString - ISO date string
 * @param formatString - date-fns format string (default: 'PP' for localized date)
 * @returns Formatted date string in Kathmandu timezone
 */
export function formatDate(dateString: string | null | undefined, formatString = 'PP'): string {
  if (!dateString) return 'N/A';

  try {
    const date = parseISO(dateString);
    const zonedDate = toZonedTime(date, KATHMANDU_TIMEZONE);
    return format(zonedDate, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Format a date string to display in Kathmandu timezone with time
 * @param dateString - ISO date string
 * @returns Formatted date and time string in Kathmandu timezone
 */
export function formatDateTime(dateString: string | null | undefined): string {
  return formatDate(dateString, 'PPp');
}

/**
 * Convert AD date to BS (Bikram Sambat) date
 * @param dateString - ISO date string
 * @returns BS date object with year, month, date, and formatted string
 */
function convertToBS(dateString: string | null | undefined): { year: number; month: number; date: number; formatted: string } | null {
  if (!dateString) return null;

  try {
    const date = parseISO(dateString);
    const zonedDate = toZonedTime(date, KATHMANDU_TIMEZONE);
    const year = zonedDate.getFullYear();
    const month = zonedDate.getMonth() + 1; // JavaScript months are 0-indexed
    const day = zonedDate.getDate();

    // Convert to YYYY-MM-DD format for the converter
    const adDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const bsDate = new DateConverter(adDateString).toBs();

    const monthName = NEPALI_MONTHS[bsDate.month - 1] || '';
    const nepaliYear = toNepaliNumerals(bsDate.year);
    const nepaliDate = toNepaliNumerals(bsDate.date);
    const formatted = `${nepaliYear} ${monthName} ${nepaliDate}`;

    return {
      year: bsDate.year,
      month: bsDate.month,
      date: bsDate.date,
      formatted
    };
  } catch (error) {
    console.error('Error converting to BS date:', error);
    return null;
  }
}

/**
 * Format a date string to display both AD and BS dates
 * @param dateString - ISO date string
 * @param formatString - date-fns format string (default: 'PP' for localized date)
 * @returns Formatted date string with both AD and BS dates
 */
export function formatDateWithBS(dateString: string | null | undefined, formatString = 'PP'): string {
  if (!dateString) return 'N/A';

  const adDate = formatDate(dateString, formatString);
  const bsDate = convertToBS(dateString);

  if (bsDate) {
    return `${adDate} (${bsDate.formatted})`;
  }

  return adDate;
}

/**
 * Format a date range for case details with both AD and BS dates
 * @param startDate - Case start date
 * @param endDate - Case end date
 * @param ongoingText - Translated text for "Ongoing" (default: "Ongoing")
 * @returns Formatted date range or "Ongoing" if no end date, with BS dates
 */
export function formatCaseDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  ongoingText: string = 'Ongoing'
): string {
  if (!startDate && !endDate) return 'N/A';

  // If no start date but has end date, just show end date
  if (!startDate && endDate) {
    return formatDateWithBS(endDate);
  }

  // If has start date but no end date, show as ongoing
  if (startDate && !endDate) {
    return `${formatDateWithBS(startDate)} - ${ongoingText}`;
  }

  // If both dates exist, check if they're the same day
  if (startDate && endDate) {
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      // If dates are the same day, show single date
      if (isSameDay(start, end)) {
        return formatDateWithBS(startDate);
      }

      // Otherwise show date range
      return `${formatDateWithBS(startDate)} - ${formatDateWithBS(endDate)}`;
    } catch (error) {
      console.error('Error comparing dates:', error);
      // Fallback to showing both dates even if comparison fails
      return `${formatDateWithBS(startDate)} - ${formatDateWithBS(endDate)}`;
    }
  }

  return 'N/A';
}
