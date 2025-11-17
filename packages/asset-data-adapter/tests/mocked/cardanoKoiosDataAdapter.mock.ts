import { NETWORKS } from '@rosen-ui/constants';

export const CardanoAddressInfoMockValue = [{ balance: 5000000 }];

export const koiosAPIAddressAssetsMockedData = [
  { policy_id: 'policy1', asset_name: 'token1', quantity: 1000 },
  { policy_id: 'policy2', asset_name: 'token2', quantity: 2000 },
];

export const CardanoAdapterGetAddressAssetsResult = [
  { assetId: NETWORKS.cardano.nativeToken, balance: BigInt(5000000) },
  { assetId: 'policy1.token1', balance: BigInt(1000) },
  { assetId: 'policy2.token2', balance: BigInt(2000) },
];
