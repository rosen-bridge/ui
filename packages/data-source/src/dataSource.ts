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
  CommitmentEntity,
  EventTriggerEntity,
  migrations as watcherDataMigrations,
} from '@rosen-bridge/watcher-data-extractor';
import {
  BridgedAssetEntity,
  LockedAssetEntity,
  TokenEntity,
  migrations as assetCalculatorMigrations,
} from '@rosen-ui/asset-calculator';
import {
  AggregatedStatusChangedEntity,
  AggregatedStatusEntity,
  GuardStatusChangedEntity,
  GuardStatusEntity,
  TxEntity,
  migrations as publicStatusMigrations,
} from '@rosen-ui/public-status';

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
      CommitmentEntity,
      AggregatedStatusEntity,
      AggregatedStatusChangedEntity,
      GuardStatusEntity,
      GuardStatusChangedEntity,
      CommitmentEntity,
      TxEntity,
    ],
    migrations: [
      ...watcherDataMigrations.postgres,
      ...observationExtractorMigrations.postgres,
      ...scannerMigrations.postgres,
      ...assetCalculatorMigrations.postgres,
      ...publicStatusMigrations.postgres,
    ],
  });
};
