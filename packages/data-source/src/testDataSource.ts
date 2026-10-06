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
  migrations as tokenPriceMigrations,
} from '@rosen-bridge/token-price-entity';
import {
  CommitmentEntity,
  EventTriggerEntity,
  migrations as eventTriggerExtractorMigrations,
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

export const testDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
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
    MetricEntity,
    WatcherCountEntity,
    UserEventEntity,
    EventCountEntity,
    BridgedAmountEntity,
    BridgeFeeEntity,
    TokenPriceEntity,
  ],
  migrations: [
    ...eventTriggerExtractorMigrations.sqlite,
    ...observationExtractorMigrations.sqlite,
    ...scannerMigrations.sqlite,
    ...assetAggregatorMigrations.sqlite,
    ...addressExtractorMigrations.sqlite,
    ...publicStatusMigrations.sqlite,
    ...statisticsMigrations.sqlite,
    ...tokenPriceMigrations.sqlite,
  ],
  synchronize: false,
  logging: false,
});
