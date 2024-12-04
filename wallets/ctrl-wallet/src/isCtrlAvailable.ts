export const isCtrlAvailable = (): boolean => {
  return typeof window.xfi !== 'undefined' && !!window.xfi.bitcoin;
};
