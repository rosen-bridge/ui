/**
 * Format a Unix timestamp (ms) to a readable date-time string (en-US).
 *
 * @param timestamp - Timestamp in milliseconds
 * @returns Formatted string or `"Invalid DateTime"` if input is invalid
 *
 * @remarks
 * - `undefined`, `null`, `NaN` → `"Invalid DateTime"`
 * - `0` is valid (Unix epoch)
 */
export const formatDateTime = (timestamp?: number): string => {
  if (
    timestamp === undefined ||
    timestamp === null ||
    Number.isNaN(timestamp) ||
    !Number.isFinite(timestamp)
  ) {
    return 'Invalid DateTime';
  }

  const date = new Date(timestamp);

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(date)
    .replace(/,\s*/g, ' ');
};
