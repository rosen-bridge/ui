import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { TokenPriceAction } from '@rosen-bridge/token-price-entity';
import { LockedAssetEntity } from '@rosen-ui/asset-calculator';

import { METRIC_KEYS } from '../constants';
import { MetricAction } from './MetricAction';

export class LockedAssetsMetricAction {
  private readonly lockedAssetRepo: Repository<LockedAssetEntity>;
  private readonly metricAction: MetricAction;
  private readonly tokenPriceAction: TokenPriceAction;
  readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.lockedAssetRepo = dataSource.getRepository(LockedAssetEntity);
    this.metricAction = new MetricAction(dataSource, logger);
    this.tokenPriceAction = new TokenPriceAction(dataSource, logger);
    this.logger = logger ?? new DummyLogger();
  }

  /**
   * Calculate total USD value of all locked assets and persist it as a metric.
   *
   * The calculation is done by:
   *  - fetching all locked assets
   *  - resolving the latest token price for each tokenId
   *  - multiplying amount * price
   *  - summing the USD values
   */
  calculateAndStoreLockedAssetsUsd = async (): Promise<void> => {
    const timestamp = Math.floor(Date.now() / 1000);

    this.logger.debug(`Calculating locked assets USD value at [${timestamp}]`);

    const lockedAssets = await this.lockedAssetRepo.find();

    if (lockedAssets.length === 0) {
      this.logger.warn('No locked assets found');
      return;
    }

    let totalUsdValue = 0;

    for (const asset of lockedAssets) {
      const latestPrice = await this.tokenPriceAction.getLatestTokenPrice(
        asset.tokenId,
        timestamp,
      );

      if (!latestPrice) {
        this.logger.debug(`No price found for tokenId [${asset.tokenId}]`);
        return;
      }

      const amount = Number(asset.amount);
      const usdValue = amount * latestPrice;

      totalUsdValue += usdValue;
    }

    this.logger.debug(`Total locked assets USD value: [${totalUsdValue}]`);

    await this.metricAction.upsertMetric(
      METRIC_KEYS.LOCKED_ASSETS_USD,
      totalUsdValue.toString(),
      timestamp,
    );
  };
}
