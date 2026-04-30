import {
  BlockEntity,
  migrations as abstractScannerMigrations,
} from '@rosen-bridge/abstract-scanner';
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
  BridgeFeeEntity,
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
      BridgeFeeEntity,
      BlockEntity,
    ],
    migrations: [
      ...statisticsMigrations.sqlite,
      ...watcherExtractorMigration.sqlite,
      ...assetCalculatorMigrations.sqlite,
      ...abstractScannerMigrations.sqlite,
    ],
    synchronize: false,
    logging: false,
  });

  await ds.initialize();
  await ds.runMigrations();

  return ds;
};
