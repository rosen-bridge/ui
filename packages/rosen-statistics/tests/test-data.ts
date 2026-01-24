import { RosenTokens } from '@rosen-bridge/tokens';

export const tokenMapData: RosenTokens = [
  {
    ergo: {
      tokenId:
        '1111111111111111111111111111111111111111111111111111111111111111',
      extra: {},
      name: 'test token1',
      decimals: 0,
      type: 'tokenType',
      residency: 'native',
    },
    cardano: {
      tokenId: 'policyId2.assetName2',
      extra: {
        policyId: 'policyId2',
        assetName: 'assetName2',
      },
      name: 'asset1',
      decimals: 0,
      type: 'tokenType',
      residency: 'wrapped',
    },
  },
  {
    ergo: {
      tokenId:
        '2222222222222222222222222222222222222222222222222222222222222222',
      extra: {},
      name: 'test token2',
      decimals: 0,
      type: 'tokenType',
      residency: 'native',
    },
    cardano: {
      tokenId: 'policyId2.assetName2',
      extra: {
        policyId: 'policyId2',
        assetName: 'assetName2',
      },
      name: 'asset2',
      decimals: 0,
      type: 'tokenType',
      residency: 'wrapped',
    },
  },
  {
    ergo: {
      tokenId: 'tokenId',
      extra: {},
      name: 'test token3',
      decimals: 0,
      type: 'tokenType',
      residency: 'wrapped',
    },
    cardano: {
      tokenId: 'policyId3.assetName3',
      extra: {
        policyId: 'policyId3',
        assetName: 'assetName3',
      },
      name: 'asset3',
      decimals: 0,
      type: 'tokenType',
      residency: 'native',
    },
  },
];
