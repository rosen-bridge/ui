/**
 * Converts a timestamp to the start of its day
 *
 * @param timestamp - Input timestamp in seconds since Unix epoch
 * @returns Timestamp in seconds representing the start of the same day
 */
export const startOfDay = (timestamp: number): number => {
  const d = new Date(timestamp * 1000);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
};
