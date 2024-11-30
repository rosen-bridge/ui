export const isFlintAvailable = (): boolean => {
  return typeof window.cardano !== 'undefined' && !!window.cardano?.flint;
};
