import { isNetworkAvailable } from '@rosen-ui/constants';

/** Preserve legacy registry entries and append only a constructed, assigned BCH consumer. */
export const withBitcoinCash = <T>(
  legacy: Readonly<Record<string, T>>,
  bitcoinCash?: T,
): Readonly<Record<string, T>> =>
  Object.freeze({
    ...legacy,
    ...(bitcoinCash !== undefined && isNetworkAvailable('bitcoin-cash') ? { bitcoinCash } : {}),
  });
