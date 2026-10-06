import { NETWORKS } from '@rosen-ui/constants';

export const explorerClientFiroReturnValue = {
  data: '1234567890',
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
};

export const expectedFiroGetAddressAssetsResult = [
  {
    assetId: NETWORKS.firo.nativeToken,
    balance: 1234567890n,
  },
];
