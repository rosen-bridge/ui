import { NETWORKS } from '@rosen-ui/constants';

export const rpcClientMockReturnValue = {
  data: { chain_stats: { funded_txo_sum: 150n, spent_txo_sum: 50n } },
};

export const expectedBitcoinGetAddressAssetsResult = [
  {
    assetId: NETWORKS.bitcoin.nativeToken,
    balance: 100n,
  },
];
