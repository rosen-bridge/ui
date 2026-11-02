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
  migrations as addressExtractorMigrations,
  BoxEntity,
} from '@rosen-bridge/address-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  TokenPriceEntity,
  migrations as TokenPriceMigrations,
} from '@rosen-bridge/token-price-entity';
import {
  CommitmentEntity,
  EventTriggerEntity,
  migrations as watcherDataMigrations,
} from '@rosen-bridge/watcher-data-extractor';
import {
  migrations as assetAggregatorMigrations,
  BridgedAssetEntity,
  LockedAssetEntity,
  TokenEntity,
} from '@rosen-ui/asset-aggregator';
import {
  AggregatedStatusChangedEntity,
  AggregatedStatusEntity,
  EventStatusOverrideEntity,
  GuardStatusChangedEntity,
  GuardStatusEntity,
  migrations as publicStatusMigrations,
  TxEntity,
} from '@rosen-ui/public-status';
import {
  BridgedAmountEntity,
  BridgeFeeEntity,
  EventCountEntity,
  MetricEntity,
  migrations as statisticsMigrations,
  UserEventEntity,
  WatcherCountEntity,
} from '@rosen-ui/rosen-statistics-entity';

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
      BoxEntity,
      AggregatedStatusEntity,
      AggregatedStatusChangedEntity,
      EventStatusOverrideEntity,
      GuardStatusEntity,
      GuardStatusChangedEntity,
      CommitmentEntity,
      TxEntity,
      TokenPriceEntity,
      BridgedAmountEntity,
      BridgeFeeEntity,
      EventCountEntity,
      MetricEntity,
      UserEventEntity,
      WatcherCountEntity,
    ],
    migrations: [
      ...watcherDataMigrations.postgres,
      ...observationExtractorMigrations.postgres,
      ...scannerMigrations.postgres,
      ...assetAggregatorMigrations.postgres,
      ...addressExtractorMigrations.postgres,
      ...publicStatusMigrations.postgres,
      ...TokenPriceMigrations.postgres,
      ...statisticsMigrations.postgres,
    ],
  });
};
