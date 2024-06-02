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
import {
  BridgedAssetEntity,
  LockedAssetEntity,
  TokenEntity,
  migrations as assetCalculatorMigrations,
} from '@rosen-ui/asset-calculator';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  ssl: process.env.POSTGRES_USE_SSL === 'true',
  synchronize: false,
  logging: false,
  entities: [
    BlockEntity,
    EventTriggerEntity,
    ObservationEntity,
    TokenEntity,
    LockedAssetEntity,
    BridgedAssetEntity,
  ],
  migrations: [
    ...eventTriggerExtractorMigrations.postgres,
    ...observationExtractorMigrations.postgres,
    ...scannerMigrations.postgres,
    ...assetCalculatorMigrations.postgres,
  ],
});

export default dataSource;
