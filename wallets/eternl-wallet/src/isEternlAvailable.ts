export const isEternlAvailable = (): boolean => {
  return typeof cardano !== 'undefined' && !!cardano?.eternl;
};
