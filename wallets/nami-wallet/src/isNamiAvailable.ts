export const isNamiAvailable = () => {
  return typeof window.cardano !== 'undefined' && !!window.cardano?.nami;
};
