import { NETWORKS } from '@rosen-ui/constants';

export const blockCypherClientDogeReturnValue = {
  data: { final_balance: 100n },
};

export const expectedDogeGetAddressAssetsResult = [
  {
    assetId: NETWORKS.doge.nativeToken,
    balance: 100n,
  },
];
