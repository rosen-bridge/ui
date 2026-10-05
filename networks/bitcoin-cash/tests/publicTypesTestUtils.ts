import { BitcoinCash } from '@rosen-bridge/icons';
import type { Network } from '@rosen-network/base';

import type { BitcoinCashNetwork } from '../src/client';

/** Compile-time consumer of the existing icon export and network interface. */
export const assertPublicIconTypes = (): void => {
  const component: Network['logo'] = BitcoinCash;
  const legacy: Network['logo'] = 'https://example.invalid/icon.svg';
  const bch: BitcoinCashNetwork['logo'] = BitcoinCash;
  void component;
  void legacy;
  void bch;
  // @ts-expect-error The shared Network logo cannot accept arbitrary numeric data.
  const invalidLogo: Network['logo'] = 42;
  void invalidLogo;
};
