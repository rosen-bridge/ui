import { RosenTokens } from '@rosen-bridge/tokens';

export const tokenMap: RosenTokens = {
  idKeys: {
    ergo: 'tokenId',
    cardano: 'tokenId',
  },
  tokens: [
    {
      ergo: {
        tokenId:
          '1111111111111111111111111111111111111111111111111111111111111111',
        name: 'test token1',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'native',
        },
      },
      cardano: {
        tokenId: 'policyId2.assetName2',
        policyId: 'policyId2',
        assetName: 'assetName2',
        name: 'asset1',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'wrapped',
        },
      },
    },
    {
      ergo: {
        tokenId:
          '2222222222222222222222222222222222222222222222222222222222222222',
        name: 'test token2',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'native',
        },
      },
      cardano: {
        tokenId: 'policyId2.assetName2',
        policyId: 'policyId2',
        assetName: 'assetName2',
        name: 'asset2',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'wrapped',
        },
      },
    },
    {
      ergo: {
        tokenId: 'tokenId',
        name: 'test token3',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'wrapped',
        },
      },
      cardano: {
        tokenId: 'policyId3.assetName3',
        policyId: 'policyId3',
        assetName: 'assetName3',
        name: 'asset3',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'native',
        },
      },
    },
  ],
};
