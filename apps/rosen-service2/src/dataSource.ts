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
  migrations as watcherDataMigrations,
} from '@rosen-bridge/watcher-data-extractor';
import {
  migrations as assetAggregatorMigrations,
  BridgedAssetEntity,
  LockedAssetEntity,
  TokenEntity,
} from '@rosen-ui/asset-aggregator';
import {
  BridgedAmountEntity,
  BridgeFeeEntity,
  EventCountEntity,
  MetricEntity,
  migrations as statisticsMigrations,
  UserEventEntity,
  WatcherCountEntity,
} from '@rosen-ui/rosen-statistics-entity';

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
    BridgeFeeEntity,
    BridgedAmountEntity,
    MetricEntity,
    WatcherCountEntity,
    EventCountEntity,
    UserEventEntity,
    TokenPriceEntity,
    CommitmentEntity,
  ],
  migrations: [
    ...scannerMigrations.postgres,
    ...watcherDataMigrations.postgres,
    ...observationExtractorMigrations.postgres,
    ...assetAggregatorMigrations.postgres,
    ...addressExtractorMigrations.postgres,
    ...statisticsMigrations.postgres,
    ...tokenPriceMigrations.postgres,
  ],
  host: configs.db.host,
  port: configs.db.port,
  username: configs.db.username,
  password: configs.db.password,
  database: configs.db.name,
  synchronize: false,
  logging: false,
});
