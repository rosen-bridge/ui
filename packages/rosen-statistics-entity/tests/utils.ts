import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  EventTriggerEntity,
  migrations as watcherExtractorMigration,
} from '@rosen-bridge/watcher-data-extractor';

import {
  MetricEntity,
  EventCountEntity,
  migrations as statisticsMigrations,
} from '../lib';

export const createDatabase = async () => {
  const ds = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [MetricEntity, EventTriggerEntity, EventCountEntity],
    migrations: [
      ...statisticsMigrations.sqlite,
      ...watcherExtractorMigration.sqlite,
    ],
    synchronize: false,
    logging: false,
  });

  await ds.initialize();
  await ds.runMigrations();

  return ds;
};
