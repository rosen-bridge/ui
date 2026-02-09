export const startOfDay = (timestamp: number): number => {
  const d = new Date(timestamp * 1000);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
};
