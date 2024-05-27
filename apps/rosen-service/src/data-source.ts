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

import config from './configs';

import AppError from './errors/AppError';

const getDataSource = () => {
  try {
    return new DataSource({
      type: 'postgres',
      url: config.postgres.url,
      synchronize: false,
      logging: config.postgres.logging,
      ssl: config.postgres.useSSL,
      entities: [
        BlockEntity,
        EventTriggerEntity,
        ObservationEntity,
        BridgedAssetEntity,
        TokenEntity,
        LockedAssetEntity,
      ],
      migrations: [
        ...eventTriggerExtractorMigrations.postgres,
        ...observationExtractorMigrations.postgres,
        ...scannerMigrations.postgres,
        ...assetCalculatorMigrations.postgres,
      ],
    });
  } catch (error) {
    throw new AppError(
      `cannot create data source due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
      {
        db: {
          url: config.postgres.url,
          logging: config.postgres.logging,
          ssl: config.postgres.useSSL,
        },
      }
    );
  }
};

const dataSource = getDataSource();

export default dataSource;
