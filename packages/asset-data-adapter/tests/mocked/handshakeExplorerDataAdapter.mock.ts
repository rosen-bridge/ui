import { NETWORKS } from '@rosen-ui/constants';

export const explorerClientHnsReturnValue = {
  data: [
    {
      version: 0,
      height: 349747,
      value: 5000000000,
      address: 'addr1',
      covenant: {
        type: 0,
        action: 'NONE',
        items: [],
      },
      coinbase: false,
      hash: '59835c0648da402d7ced55749de9d821f4746522f232ea66c7585a534ddba724',
      index: 2,
    },
  ],
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
};

export const expectedHnsGetAddressAssetsResult = [
  {
    assetId: NETWORKS.handshake.nativeToken,
    balance: 5000000000n,
  },
];
