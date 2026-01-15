import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { LockedAssetEntity } from '@rosen-ui/asset-calculator';

import { METRIC_KEYS } from '../constants';
import { MetricAction } from './MetricAction';

export class LockedAssetsMetricAction {
  private readonly metricAction: MetricAction;
  readonly logger: AbstractLogger;

  constructor(
    private readonly dataSource: DataSource,
    logger?: AbstractLogger,
  ) {
    this.metricAction = new MetricAction(dataSource, logger);
    this.logger = logger ?? new DummyLogger();
  }

  /**
   * Calculate total USD value of locked assets using
   */
  calculateAndStoreLockedAssetsUsd = async (): Promise<void> => {
    const timestamp = Math.floor(Date.now() / 1000);

    this.logger.debug(`Calculating locked assets USD value at [${timestamp}]`);

    const lockedAssetRepo = this.dataSource.getRepository(LockedAssetEntity);

    const result = await lockedAssetRepo
      .createQueryBuilder('la')
      .innerJoin(
        TokenPriceEntity,
        'tp',
        `
          tp.tokenId = la.tokenId
          AND tp.timestamp = (
            SELECT MAX(tp2.timestamp)
            FROM token_price_entity tp2
            WHERE tp2.tokenId = la.tokenId
              AND tp2.timestamp < :timestamp
          )
        `,
      )
      .select('SUM(CAST(la.amount AS NUMERIC) * tp.price)', 'totalUsdValue')
      .setParameter('timestamp', timestamp)
      .getRawOne<{ totalUsdValue: string | null }>();

    if (!result?.totalUsdValue) {
      this.logger.debug('No locked assets with valid prices found');
      return;
    }

    this.logger.debug(
      `Total locked assets USD value: [${result.totalUsdValue}]`,
    );

    await this.metricAction.upsertMetric(
      METRIC_KEYS.LOCKED_ASSETS_USD,
      result.totalUsdValue,
      timestamp,
    );
  };
}
