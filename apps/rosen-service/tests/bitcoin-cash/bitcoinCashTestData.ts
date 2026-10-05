import { NATIVE_TOKEN, type RosenChainToken } from '@rosen-bridge/tokens';

/** Deterministic mainnet P2PKH treasury addresses; no wallet is contacted. */
export const addresses = [
  'bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a',
  'bitcoincash:qqqszqgpqyqszqgpqyqszqgpqyqszqgpqyrygcdp8p',
];

/** Complete opt-in service profile with synthetic Rosen-controlled Ergo values. */
export const serviceConfig = {
  enabled: true,
  lockAddress: addresses[0],
  initialHeight: 800000,
  rpc: { url: 'https://example.invalid', timeoutMs: 10000 },
  cleanup: { thresholdSeconds: 86400, trimCount: 100 },
  commitment: {
    address: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
    rwt: '11'.repeat(32),
  },
  eventTrigger: {
    address: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
    permitAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
    fraudAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
  },
  electrum: { hostname: 'example.invalid', port: 50002, timeoutMs: 30000 },
  calculatorAddresses: [addresses[0]],
};

/** Eight-decimal native BCH metadata used by Service accounting fixtures. */
export const nativeToken: RosenChainToken = {
  tokenId: 'bch',
  name: 'Bitcoin Cash',
  decimals: 8,
  type: NATIVE_TOKEN,
  residency: 'native',
  extra: {},
};

/** Synthetic three-decimal Ergo token used to check shared wrapping rounding. */
export const wrappedToken: RosenChainToken = {
  tokenId: '11'.repeat(32),
  name: 'Wrapped Bitcoin Cash',
  decimals: 3,
  type: 'token',
  residency: 'wrapped',
  extra: {},
};
