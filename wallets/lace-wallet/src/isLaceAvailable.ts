export const isLaceAvailable = () => {
  return typeof cardano !== 'undefined' && cardano?.lace;
};
