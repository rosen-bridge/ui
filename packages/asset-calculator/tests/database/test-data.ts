import { AssetEntity } from '../../lib/database/asset-entity';

const assets: AssetEntity[] = [
  {
    id: 'id',
    name: 'name',
    decimal: 0,
    amount: 100n,
    isNative: true,
    chain: 'Ergo',
  },
  {
    id: 'id2',
    name: 'name2',
    decimal: 1,
    amount: 200n,
    isNative: false,
    chain: 'Cardano',
  },
];

export { assets };
