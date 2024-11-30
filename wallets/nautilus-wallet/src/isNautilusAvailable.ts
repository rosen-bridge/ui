export const isNautilusAvailable = (): boolean => {
  return (
    typeof window.ergoConnector !== 'undefined' &&
    !!window.ergoConnector.nautilus
  );
};
