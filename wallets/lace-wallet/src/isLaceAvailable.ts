export const isLaceAvailable = () => {
  return typeof window.cardano !== 'undefined' && !!window.cardano?.lace;
};
