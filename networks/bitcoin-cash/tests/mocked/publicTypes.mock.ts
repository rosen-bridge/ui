import { BitcoinCash, type SVGIcon } from '@rosen-bridge/icons';
import type { Network } from '@rosen-network/base';

import type { BitcoinCashNetwork } from '../../src/client';

/** Compile-time consumer: SVG exports remain typed and legacy string logos remain supported. */
export const assertPublicIconTypes = (): void => {
  const icon: SVGIcon = BitcoinCash;
  const component: Network['logo'] = icon;
  const legacy: Network['logo'] = 'https://example.invalid/icon.svg';
  const bch: BitcoinCashNetwork['logo'] = icon;
  void component;
  void legacy;
  void bch;
  // @ts-expect-error Public icons must not degrade to any from a JavaScript chunk reexport.
  const number: number = BitcoinCash;
  // @ts-expect-error SVG component props must reject unknown fields.
  BitcoinCash({ unsupportedFixtureProp: true });
  // @ts-expect-error The shared Network logo cannot accept arbitrary numeric data.
  const invalidLogo: Network['logo'] = 42;
  void number;
  void invalidLogo;
};
