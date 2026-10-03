export const TOKEN_NAME_PLACEHOLDER = 'unnamed token';

export const HEALTH_DATA_REFRESH_INTERVAL = 60000;

export const NETWORKS = {
  'binance': {
    index: 4,
    key: 'binance',
    label: 'Binance',
    nativeToken: 'bnb',
    id: '0x38',
    hasTokenSupport: true,
  },
  'bitcoin': {
    index: 2,
    key: 'bitcoin',
    label: 'Bitcoin',
    nativeToken: 'btc',
    id: '',
    hasTokenSupport: false,
  },
  'bitcoin-cash': {
    // Rosen owns the production assignment; a candidate fixture index is not activation.
    index: -1,
    key: 'bitcoin-cash',
    label: 'Bitcoin Cash',
    nativeToken: 'bch',
    id: '',
    hasTokenSupport: false,
  },
  'bitcoin-runes': {
    index: 6,
    key: 'bitcoin-runes',
    label: 'Bitcoin Runes',
    nativeToken: 'btc',
    id: '',
    hasTokenSupport: true,
  },
  'cardano': {
    index: 1,
    key: 'cardano',
    label: 'Cardano',
    nativeToken: 'ada',
    id: '',
    hasTokenSupport: true,
  },
  'ergo': {
    index: 0,
    key: 'ergo',
    label: 'Ergo',
    nativeToken: 'erg',
    id: '',
    hasTokenSupport: true,
  },
  'ethereum': {
    index: 3,
    key: 'ethereum',
    label: 'Ethereum',
    nativeToken: 'eth',
    id: '0x1',
    hasTokenSupport: true,
  },
  'doge': {
    index: 5,
    key: 'doge',
    label: 'Doge',
    nativeToken: 'doge',
    id: '',
    hasTokenSupport: false,
  },
  'firo': {
    index: 7,
    key: 'firo',
    label: 'Firo',
    nativeToken: 'firo',
    id: '',
    hasTokenSupport: false,
  },
  'handshake': {
    index: 8,
    key: 'handshake',
    label: 'Handshake',
    nativeToken: 'hns',
    id: '',
    hasTokenSupport: false,
  },
} as const;

/**
 * Whether a chain has an assigned Rosen index and can enter network selection.
 * @param network Untrusted chain key from configuration or token metadata.
 * @returns False for unknown keys and chains awaiting Rosen index assignment.
 * @remarks Assigned identity alone does not establish operator configuration,
 * wallet availability or deployment approval; consumers must check those too.
 */
export const isNetworkAvailable = (network: string): network is keyof typeof NETWORKS =>
  Object.hasOwn(NETWORKS, network) && NETWORKS[network as keyof typeof NETWORKS].index >= 0;

// Operational selectors and service loops must not consume an unassigned chain.
export const NETWORKS_KEYS = Object.values(NETWORKS)
  .filter((network) => isNetworkAvailable(network.key))
  .map((network) => network.key);
