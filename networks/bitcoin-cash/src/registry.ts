import { NETWORKS } from '@rosen-ui/constants';

/** Check an assigned destination in the existing registry before encoding a BCH lock. */
export const isBitcoinCashRouteAvailable = (chain: unknown): chain is keyof typeof NETWORKS => {
  if (typeof chain !== 'string' || !Object.hasOwn(NETWORKS, chain)) return false;
  const entry = NETWORKS[chain as keyof typeof NETWORKS];
  return (
    entry.key === chain && Number.isInteger(entry.index) && entry.index >= 0 && entry.index <= 255
  );
};
