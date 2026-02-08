import { RosenTokens } from '@rosen-bridge/tokens';

export const testTokenMap: RosenTokens = [
  {
    ergo: {
      tokenId: 'erg',
      name: 'ERG',
      decimals: 2,
      type: 'native',
      residency: 'native',
      extra: {},
    },
  },
  {
    ergo: {
      tokenId: 'test-token-id-1',
      name: 'test token 1',
      decimals: 2,
      type: 'tokenType',
      residency: 'wrapped',
      extra: {},
    },
  },
];
