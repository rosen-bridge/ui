import { BITCOIN_NATIVE_ASSET_KEY } from '@rosen-ui/constants';

export const rpcClientMockReturnValue = {
  data: { chain_stats: { funded_txo_sum: 150n, spent_txo_sum: 50n } },
};

export const expectedBitcoinGetAddressAssetsResult = [
  {
    assetId: BITCOIN_NATIVE_ASSET_KEY,
    balance: 100n,
  },
];
