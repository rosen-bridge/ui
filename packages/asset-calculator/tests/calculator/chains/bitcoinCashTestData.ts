import { NATIVE_TOKEN, type RosenChainToken } from '@rosen-bridge/tokens';

/** Deterministic native mainnet addresses; no wallet or endpoint is contacted. */
export const addresses = [
  'bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a',
  'bitcoincash:qqqszqgpqyqszqgpqyqszqgpqyqszqgpqyrygcdp8p',
];

/** Eight-decimal BCH native source metadata with its native asset identifier. */
export const nativeToken: RosenChainToken = {
  tokenId: 'bch',
  name: 'Bitcoin Cash',
  decimals: 8,
  type: NATIVE_TOKEN,
  residency: 'native',
  extra: {},
};
/** Synthetic three-decimal Ergo token used to exercise native-to-wrapped rounding. */
export const wrappedToken: RosenChainToken = {
  tokenId: '11'.repeat(32),
  name: 'Wrapped Bitcoin Cash',
  decimals: 3,
  type: 'token',
  residency: 'wrapped',
  extra: {},
};
