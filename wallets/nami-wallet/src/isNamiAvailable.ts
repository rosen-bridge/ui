export const isNamiAvailable = () => {
  return typeof cardano !== 'undefined' && !!cardano?.nami;
};
