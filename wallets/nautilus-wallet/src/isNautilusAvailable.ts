export const isNautilusAvailable = (): boolean => {
  return typeof ergoConnector !== 'undefined' && !!ergoConnector.nautilus;
};
