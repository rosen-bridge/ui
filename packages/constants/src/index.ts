export const healthStatusColorMap = {
  Healthy: 'success',
  Unstable: 'warning',
  Broken: 'error',
};

export const TOKEN_NAME_PLACEHOLDER = 'unnamed token';

export const HEALTH_DATA_REFRESH_INTERVAL = 60000;

/**
 * The order should be Ergo, Cardano, Bitcoin, Ethereum.
 * This sequence should be consistently used as the SUPPORTED_CHAINS.
 */
export const NETWORKS = {
  ERGO: 'ergo',
  CARDANO: 'cardano',
  BITCOIN: 'bitcoin',
  ETHEREUM: 'ethereum',
  BINANCE: 'binance',
} as const;

export const NATIVE_TOKENS = {
  ERGO: 'erg',
  CARDANO: 'ada',
  BITCOIN: 'btc',
  ETHEREUM: 'eth',
  BINANCE: 'bnb',
} as const;

/**
 * The order should be Ergo, Cardano, Bitcoin, Ethereum.
 * This sequence should be consistently used as the SUPPORTED_CHAINS.
 */
export const NETWORK_VALUES = Object.values(NETWORKS);

export const NETWORK_LABELS: { [key in keyof typeof NETWORKS]: string } = {
  ERGO: 'Ergo',
  CARDANO: 'Cardano',
  BITCOIN: 'Bitcoin',
  ETHEREUM: 'Ethereum',
  BINANCE: 'Binance',
};

export const NETWORK_LABELS_WITH_KEY: {
  [key in (typeof NETWORKS)[keyof typeof NETWORKS]]: string;
} = {
  [NETWORKS.ERGO]: NETWORK_LABELS.ERGO,
  [NETWORKS.CARDANO]: NETWORK_LABELS.CARDANO,
  [NETWORKS.BITCOIN]: NETWORK_LABELS.BITCOIN,
  [NETWORKS.ETHEREUM]: NETWORK_LABELS.ETHEREUM,
  [NETWORKS.BINANCE]: NETWORK_LABELS.BINANCE,
};
