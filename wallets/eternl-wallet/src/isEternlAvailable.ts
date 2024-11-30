export const isEternlAvailable = (): boolean => {
  return typeof window.cardano !== 'undefined' && !!window.cardano?.eternl;
};
