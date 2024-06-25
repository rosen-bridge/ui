export const isXverseAvailable = (): boolean => {
  return (
    typeof XverseProviders !== 'undefined' && !!XverseProviders.BitcoinProvider
  );
};
