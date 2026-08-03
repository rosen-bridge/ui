import {
  migrations as abstractScannerMigrations,
  BlockEntity,
} from '@rosen-bridge/abstract-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  EventTriggerEntity,
  migrations as watcherExtractorMigration,
} from '@rosen-bridge/watcher-data-extractor';
import {
  migrations as assetCalculatorMigrations,
  LockedAssetEntity,
  TokenEntity,
} from '@rosen-ui/asset-calculator';

import {
  BridgedAmountEntity,
  BridgeFeeEntity,
  EventCountEntity,
  MetricEntity,
  migrations as statisticsMigrations,
  UserEventEntity,
  WatcherCountEntity,
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
      BridgedAmountEntity,
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
