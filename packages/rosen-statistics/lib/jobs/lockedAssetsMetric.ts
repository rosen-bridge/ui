import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenPriceAction } from '@rosen-bridge/token-price-entity';
import {
  LockedAssetsMetricAction,
  METRIC_KEYS,
  MetricAction,
} from '@rosen-ui/rosen-statistics-entity';

/**
 * Calculate and persist locked assets usd metric.
 *
 * @param dataSource DataSource instance for database operations
 * @param logger     Optional logger instance
 */
export const lockedAssetsMetric = async (
  dataSource: DataSource,
  logger: AbstractLogger = new DummyLogger(),
): Promise<void> => {
  logger.debug('Calculating and storing locked assets usd metric...');
  const lockedAssetsMetricAction = new LockedAssetsMetricAction(
    dataSource,
    logger,
  );
  const metricAction = new MetricAction(dataSource, logger);
  const tokenPriceAction = new TokenPriceAction(dataSource, logger);
  const timestamp = Math.floor(Date.now() / 1000);

  const lockedAssets = await lockedAssetsMetricAction.getLockedAssets();
  if (!lockedAssets.length) {
    logger.debug('No locked assets found');
    return;
  }

  const tokenIds = new Set(lockedAssets.map((a) => a.tokenId));
  const latestPriceMap = new Map<string, number>();

  for (const tokenId of tokenIds) {
    const price = await tokenPriceAction.getLatestTokenPrice(
      tokenId,
      timestamp,
    );
    if (!price) continue;
    latestPriceMap.set(tokenId, price);
  }
  const totalUsdValue = lockedAssets.reduce((sum, asset) => {
    const price = latestPriceMap.get(asset.tokenId);
    return sum + (price ? asset.amount * BigInt(price) : 0n);
  }, 0n);

  if (totalUsdValue === 0n) {
    logger.debug('No locked assets with valid prices found');
    return;
  }

  logger.debug(`Total locked assets USD value: [${totalUsdValue}]`);

  await metricAction.upsertMetric(
    METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD,
    totalUsdValue.toString(),
    timestamp,
  );
};
