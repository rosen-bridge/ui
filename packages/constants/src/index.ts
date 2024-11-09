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
} as const;

/**
 * The order should be Ergo, Cardano, Bitcoin, Ethereum.
 * This sequence should be consistently used as the SUPPORTED_CHAINS.
 */
export const NATIVE_TOKENS = {
  [NETWORKS.ERGO]: 'erg',
  [NETWORKS.CARDANO]: 'ada',
  [NETWORKS.BITCOIN]: 'btc',
  [NETWORKS.ETHEREUM]: 'eth',
} as const;

export const NETWORK_VALUES = Object.values(NETWORKS);

export const NETWORK_LABELS: { [key in keyof typeof NETWORKS]: string } = {
  ERGO: 'Ergo',
  CARDANO: 'Cardano',
  BITCOIN: 'Bitcoin',
  ETHEREUM: 'Ethereum',
};
