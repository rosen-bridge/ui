import { NETWORKS } from '@rosen-ui/constants';

export const expectedErgoExplorerGetAddressAssetsResult = {
  nanoErgs: 100,
  tokens: [
    { tokenId: 't1', amount: 200 },
    { tokenId: 't2', amount: 300 },
  ],
};

export const expectedErgoGetAddressAssetsResult = [
  { assetId: NETWORKS.ergo.nativeToken, balance: 100 },
  { assetId: 't1', balance: 200 },
  { assetId: 't2', balance: 300 },
];
