import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  TokenPriceEntity,
  migrations as tokenPriceMigrations,
} from '@rosen-bridge/token-price-entity';
import {
  EventTriggerEntity,
  migrations as watcherDataMigrations,
} from '@rosen-bridge/watcher-data-extractor';
import {
  LockedAssetEntity,
  TokenEntity,
  migrations as assetCalculatorMigrations,
} from '@rosen-ui/asset-calculator';

import {
  MetricEntity,
  EventCountEntity,
  UserEventEntity,
  migrations as statisticsMigrations,
} from '../lib';

export const createDatabase = async () => {
  const ds = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [
      MetricEntity,
      UserEventEntity,
      TokenPriceEntity,
      LockedAssetEntity,
      TokenEntity,
      EventCountEntity,
      EventTriggerEntity,
    ],
    migrations: [
      ...tokenPriceMigrations.sqlite,
      ...statisticsMigrations.sqlite,
      ...assetCalculatorMigrations.sqlite,
      ...watcherDataMigrations.sqlite,
    ],
    synchronize: false,
    logging: false,
  });

  await ds.initialize();
  await ds.runMigrations();

  return ds;
};
