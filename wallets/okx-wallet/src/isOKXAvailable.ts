export const isOKXAvailable = (): boolean => {
  return typeof window.okxwallet !== 'undefined' && !!window.okxwallet.bitcoin;
};
