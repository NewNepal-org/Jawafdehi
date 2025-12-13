/**
 * Date formatting utilities with Kathmandu timezone support
 * All dates on the website should be displayed in Kathmandu timezone (Asia/Kathmandu, GMT+5:45)
 */

import { format, parseISO, isSameDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const KATHMANDU_TIMEZONE = 'Asia/Kathmandu';

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
 * Format a date range for case details
 * @param startDate - Case start date
 * @param endDate - Case end date
 * @param ongoingText - Translated text for "Ongoing" (default: "Ongoing")
 * @returns Formatted date range or "Ongoing" if no end date
 */
export function formatCaseDateRange(
  startDate: string | null | undefined, 
  endDate: string | null | undefined,
  ongoingText: string = 'Ongoing'
): string {
  if (!startDate && !endDate) return 'N/A';
  
  // If no start date but has end date, just show end date
  if (!startDate && endDate) {
    return formatDate(endDate);
  }
  
  // If has start date but no end date, show as ongoing
  if (startDate && !endDate) {
    return `${formatDate(startDate)} - ${ongoingText}`;
  }
  
  // If both dates exist, check if they're the same day
  if (startDate && endDate) {
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      
      // If dates are the same day, show single date
      if (isSameDay(start, end)) {
        return formatDate(startDate);
      }
      
      // Otherwise show date range
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    } catch (error) {
      console.error('Error comparing dates:', error);
      // Fallback to showing both dates even if comparison fails
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
  }
  
  return 'N/A';
}
