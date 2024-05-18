import { TokenEntity } from '../../lib';
import { BridgedAssetEntity } from '../../lib/database/bridgedAsset/BridgedAssetEntity';

const tokens: TokenEntity[] = [
  {
    id: 'erg',
    chain: 'ergo',
    decimal: 9,
    isNative: true,
    name: 'ERG',
  },
  {
    id: 'ada',
    chain: 'cardano',
    decimal: 6,
    isNative: true,
    name: 'ADA',
  },
];

const assets: BridgedAssetEntity[] = [
  {
    token: tokens[0],
    tokenId: tokens[0].id,
    amount: 100n,
    chain: 'Bitcoin',
  },
  {
    token: tokens[0],
    tokenId: tokens[0].id,
    amount: 200n,
    chain: 'Cardano',
  },
];

export { assets, tokens };
