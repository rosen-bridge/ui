import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  TokenPriceEntity,
  migrations as tokenPriceMigrations,
} from '@rosen-bridge/token-price-entity';
import {
  LockedAssetEntity,
  TokenEntity,
  migrations as assetCalculatorMigrations,
} from '@rosen-ui/asset-calculator';

import { MetricEntity, migrations as statisticsMigrations } from '../lib';

export const createDatabase = async () => {
  const ds = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [MetricEntity, TokenPriceEntity, LockedAssetEntity, TokenEntity],
    migrations: [
      ...tokenPriceMigrations.sqlite,
      ...statisticsMigrations.sqlite,
      ...assetCalculatorMigrations.sqlite,
    ],
    synchronize: false,
    logging: false,
  });

  await ds.initialize();
  await ds.runMigrations();

  return ds;
};
