import {
  ObservationEntity,
  migrations as observationExtractorMigrations,
} from '@rosen-bridge/abstract-observation-extractor';
import {
  BlockEntity,
  ExtractorStatusEntity,
  migrations as scannerMigrations,
} from '@rosen-bridge/abstract-scanner';
import {
  BoxEntity,
  migrations as addressExtractorMigrations,
} from '@rosen-bridge/address-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
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

import { configs } from './configs';

export default new DataSource({
  type: 'postgres',
  entities: [
    BlockEntity,
    EventTriggerEntity,
    ObservationEntity,
    BridgedAssetEntity,
    TokenEntity,
    LockedAssetEntity,
    ExtractorStatusEntity,
    BoxEntity,
  ],
  migrations: [
    ...scannerMigrations.postgres,
    ...eventTriggerExtractorMigrations.postgres,
    ...observationExtractorMigrations.postgres,
    ...assetCalculatorMigrations.postgres,
    ...addressExtractorMigrations.postgres,
  ],
  host: configs.db.host,
  port: configs.db.port,
  username: configs.db.username,
  password: configs.db.password,
  database: configs.db.name,
  synchronize: false,
  logging: false,
});
