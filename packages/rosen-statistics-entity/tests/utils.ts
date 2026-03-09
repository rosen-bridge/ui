import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  EventTriggerEntity,
  migrations as watcherExtractorMigration,
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
  WatcherCountEntity,
  migrations as statisticsMigrations,
} from '../lib';

export const createDatabase = async () => {
  const ds = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [
      MetricEntity,
      EventTriggerEntity,
      EventCountEntity,
      LockedAssetEntity,
      TokenEntity,
      UserEventEntity,
      WatcherCountEntity,
    ],
    migrations: [
      ...statisticsMigrations.sqlite,
      ...watcherExtractorMigration.sqlite,
      ...assetCalculatorMigrations.sqlite,
    ],
    synchronize: false,
    logging: false,
  });

  await ds.initialize();
  await ds.runMigrations();

  return ds;
};
