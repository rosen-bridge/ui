import {
  ObservationEntity,
  migrations as observationExtractorMigrations,
} from '@rosen-bridge/abstract-observation-extractor';
import {
  BlockEntity,
  ExtractorStatusEntity,
  migrations as scannerMigrations,
} from '@rosen-bridge/abstract-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  EventTriggerEntity,
  CommitmentEntity,
  migrations as watcherDataMigrations,
} from '@rosen-bridge/watcher-data-extractor';
import {
  // AssetViewEntity,
  BridgedAssetEntity,
  // EventViewEntity,
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
      AggregatedStatusEntity,
      AggregatedStatusChangedEntity,
      GuardStatusEntity,
      GuardStatusChangedEntity,
      CommitmentEntity,
      TxEntity,
      // AssetViewEntity,
      // EventViewEntity,
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
