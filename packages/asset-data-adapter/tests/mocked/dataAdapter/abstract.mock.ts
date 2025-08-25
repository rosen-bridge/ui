import { AbstractDataAdapter } from '../../../lib/dataAdapters';
import { ChainAssetBalance } from '../../../lib/interfaces';

export class TestAdapter extends AbstractDataAdapter {
  chain = 'ergo';

  getAddressAssets = (address: string): ChainAssetBalance[] => {
    if (address === 'addr1') {
      return [
        { assetId: 'token0', balance: 100n },
        { assetId: 'token1', balance: 100n },
        { assetId: 'ergo_token2', balance: 200_000n },
      ];
    }
    if (address === 'addr2') {
      return [
        { assetId: 'token0', balance: 300n },
        { assetId: 'token1', balance: 50n },
      ];
    }
    return [];
  };
}

export const sampleTokenMapConfig = [
  {
    ergo: {
      tokenId: 'token1',
      name: 'test1',
      decimals: 3,
      type: 'EIP-004',
      residency: 'native',
      extra: false,
    },
    binance: {
      tokenId: 'binance_token1',
      name: 'rpnTest1',
      decimals: 3,
      type: 'ERC-20',
      residency: 'wrapped',
      extra: false,
    },
  },
  {
    ethereum: {
      tokenId: 'token2',
      name: 'test2',
      decimals: 9,
      type: 'ERC-20',
      residency: 'native',
      extra: false,
    },
    cardano: {
      tokenId: 'cardano_token2',
      name: 'rpnTest2',
      decimals: 3,
      type: 'CIP26',
      residency: 'wrapped',
      extra: {
        policyId: '0',
        assetName: '0',
        extra: false,
      },
    },
    ergo: {
      tokenId: 'ergo_token2',
      name: 'rpnTest2',
      decimals: 6,
      type: 'EIP-004',
      residency: 'wrapped',
      extra: false,
    },
    binance: {
      tokenId: 'binance_token2',
      name: 'rpnTest2',
      decimals: 6,
      type: 'ERC-20',
      residency: 'wrapped',
      extra: false,
    },
  },
];
