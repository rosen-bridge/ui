export const isXverseAvailable = (): boolean => {
  return typeof xfi !== 'undefined' && !!xfi?.bitcoin;
};
