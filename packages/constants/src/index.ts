export const healthStatusColorMap = {
  Healthy: 'success',
  Unstable: 'warning',
  Broken: 'error',
};

export const TOKEN_NAME_PLACEHOLDER = 'unnamed token';

export const HEALTH_DATA_REFRESH_INTERVAL = 60000;

export const NETWORKS = {
  binance: {
    index: 4,
    key: 'binance',
    label: 'Binance',
    nativeToken: 'bnb',
    id: '0x38',
  },
  bitcoin: {
    index: 2,
    key: 'bitcoin',
    label: 'Bitcoin',
    nativeToken: 'btc',
    id: '',
  },
  cardano: {
    index: 1,
    key: 'cardano',
    label: 'Cardano',
    nativeToken: 'ada',
    id: '',
  },
  ergo: {
    index: 0,
    key: 'ergo',
    label: 'Ergo',
    nativeToken: 'erg',
    id: '',
  },
  ethereum: {
    index: 3,
    key: 'ethereum',
    label: 'Ethereum',
    nativeToken: 'eth',
    id: '0x1',
  },
} as const;

export const NETWORKS_KEYS = Object.values(NETWORKS).map(
  (network) => network.key,
);
