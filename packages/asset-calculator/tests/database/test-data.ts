import { NETWORKS } from '@rosen-ui/constants';

import { LockedAssetEntity, TokenEntity } from '../../lib';
import { BridgedAssetEntity } from '../../lib/database/bridgedAsset/BridgedAssetEntity';

const tokens: TokenEntity[] = [
  {
    id: 'erg',
    chain: NETWORKS.ergo.key,
    decimal: 9,
    isNative: true,
    name: 'ERG',
  },
  {
    id: 'ada',
    chain: NETWORKS.cardano.key,
    decimal: 6,
    isNative: true,
    name: 'ADA',
  },
];

const bridgedAssets: BridgedAssetEntity[] = [
  {
    token: tokens[0],
    tokenId: tokens[0].id,
    amount: 100n,
    chain: NETWORKS.bitcoin.key,
    bridgedTokenId: `123${tokens[0].id}`,
  },
  {
    token: tokens[0],
    tokenId: tokens[0].id,
    amount: 200n,
    chain: NETWORKS.cardano.key,
    bridgedTokenId: `123${tokens[0].id}`,
  },
];

const lockedAssets: LockedAssetEntity[] = [
  {
    token: tokens[0],
    tokenId: tokens[0].id,
    amount: 100n,
    address: 'Addr',
  },
  {
    token: tokens[1],
    tokenId: tokens[1].id,
    amount: 200n,
    address: 'Addr',
  },
];

export { lockedAssets, bridgedAssets, tokens };
