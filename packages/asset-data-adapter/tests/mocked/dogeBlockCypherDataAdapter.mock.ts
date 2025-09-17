import { DOGE_NATIVE_ASSET_KEY } from '@rosen-ui/constants';

export const blockCypherClientDogeReturnValue = {
  data: { final_balance: 100n },
};

export const expectedDogeGetAddressAssetsResult = [
  {
    assetId: DOGE_NATIVE_ASSET_KEY,
    balance: 100n,
  },
];
