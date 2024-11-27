export const isXdefiAvailable = (): boolean => {
  return typeof window.xfi !== 'undefined' && !!window.xfi.bitcoin;
};
