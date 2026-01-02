/**
 * Safe date formatting utilities
 * Addresses HIGH-007: Unsafe date handling
 */

/**
 * Safely formats a timestamp to a date string
 * Handles invalid dates and malformed timestamps gracefully
 * @param timestamp - Date string or Date object
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date string or 'Unknown date' if invalid
 */
export const formatDate = (
  timestamp: string | Date | undefined | null,
  locale: string = 'en-US'
): string => {
  try {
    if (!timestamp) {
      return 'Unknown date';
    }

    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }

    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Unknown date';
  }
};

/**
 * Safely formats a timestamp to a date and time string
 * @param timestamp - Date string or Date object
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date/time string or 'Unknown date' if invalid
 */
export const formatDateTime = (
  timestamp: string | Date | undefined | null,
  locale: string = 'en-US'
): string => {
  try {
    if (!timestamp) {
      return 'Unknown date';
    }

    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }

    return date.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown date';
  }
};

/**
 * Safely formats a timestamp to a time string only
 * @param timestamp - Date string or Date object
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted time string or 'Unknown time' if invalid
 */
export const formatTime = (
  timestamp: string | Date | undefined | null,
  locale: string = 'en-US'
): string => {
  try {
    if (!timestamp) {
      return 'Unknown time';
    }

    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

    if (isNaN(date.getTime())) {
      return 'Unknown time';
    }

    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown time';
  }
};

/**
 * Formats a duration in seconds to a human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "1h 30m 45s")
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
};

/**
 * Gets relative time string (e.g., "2 hours ago")
 * @param timestamp - Date string or Date object
 * @returns Relative time string
 */
export const getRelativeTime = (timestamp: string | Date | undefined | null): string => {
  try {
    if (!timestamp) return 'Unknown time';

    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

    if (isNaN(date.getTime())) return 'Unknown time';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return formatDate(date);
  } catch {
    return 'Unknown time';
  }
};

/**
 * Checks if a date is valid
 * @param timestamp - Date string or Date object
 * @returns true if date is valid, false otherwise
 */
export const isValidDate = (timestamp: string | Date | undefined | null): boolean => {
  try {
    if (!timestamp) return false;

    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Formats seconds remaining for countdown timers
 * @param seconds - Seconds remaining
 * @returns Formatted string (e.g., "02:30:45" for hours, or "05:30" for minutes)
 */
export const formatCountdown = (seconds: number): string => {
  if (seconds <= 0) return '00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${pad(minutes)}:${pad(secs)}`;
};
