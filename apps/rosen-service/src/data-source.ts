import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  ObservationEntity,
  migrations as observationExtractorMigrations,
} from '@rosen-bridge/observation-extractor';
import {
  BlockEntity,
  migrations as scannerMigrations,
} from '@rosen-bridge/scanner';
import {
  EventTriggerEntity,
  migrations as eventTriggerExtractorMigrations,
} from '@rosen-bridge/watcher-data-extractor';

import config from './configs';

const dataSource = new DataSource({
  type: 'postgres',
  url: config.postgres.url,
  synchronize: false,
  logging: config.postgres.logging,
  ssl: config.postgres.useSSL,
  entities: [BlockEntity, EventTriggerEntity, ObservationEntity],
  migrations: [
    ...eventTriggerExtractorMigrations.postgres,
    ...observationExtractorMigrations.postgres,
    ...scannerMigrations.postgres,
  ],
});

export default dataSource;
