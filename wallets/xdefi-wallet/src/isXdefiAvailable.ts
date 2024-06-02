export const isXdefiAvailable = (): boolean => {
  return typeof xfi !== 'undefined' && !!xfi?.bitcoin;
};
