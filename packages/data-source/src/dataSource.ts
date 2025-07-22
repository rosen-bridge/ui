import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  ObservationEntity,
  migrations as observationExtractorMigrations,
} from '@rosen-bridge/observation-extractor';
import {
  BlockEntity,
  ExtractorStatusEntity,
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

export const getDataSource = (
  postgresUrl: string,
  postgresUseSSL: boolean,
  postgresLogging: boolean,
) => {
  return new DataSource({
    type: 'postgres',
    url: postgresUrl,
    synchronize: false,
    logging: postgresLogging,
    ssl: postgresUseSSL,
    entities: [
      BlockEntity,
      EventTriggerEntity,
      ObservationEntity,
      BridgedAssetEntity,
      TokenEntity,
      LockedAssetEntity,
      ExtractorStatusEntity,
    ],
    migrations: [
      ...eventTriggerExtractorMigrations.postgres,
      ...observationExtractorMigrations.postgres,
      ...scannerMigrations.postgres,
      ...assetCalculatorMigrations.postgres,
    ],
  });
};
