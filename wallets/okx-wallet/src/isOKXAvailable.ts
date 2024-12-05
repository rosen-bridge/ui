export const isOKXAvailable = (): boolean => {
  return typeof (window as any).okxwallet !== 'undefined';
};
