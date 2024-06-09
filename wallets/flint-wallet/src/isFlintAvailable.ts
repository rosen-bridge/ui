export const isFlintAvailable = (): boolean => {
  return typeof cardano !== 'undefined' && !!cardano?.flint;
};
