import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
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

  const lockedAssets = await lockedAssetsMetricAction.getLockedAssets();
  if (!lockedAssets.length) {
    logger.debug('No locked assets found');
    return;
  }

  const tokenIds = [...new Set(lockedAssets.map((a) => a.tokenId))];
  const tokenPrices =
    await lockedAssetsMetricAction.getLatestTokenPrices(tokenIds);

  const latestPriceMap = new Map<string, number>();
  tokenPrices.forEach((tp) => {
    if (!latestPriceMap.has(tp.tokenId)) {
      latestPriceMap.set(tp.tokenId, Number(tp.price));
    }
  });

  const totalUsdValue = lockedAssets.reduce((sum, asset) => {
    const price = latestPriceMap.get(asset.tokenId);
    return sum + (price ? Number(asset.amount) * price : 0);
  }, 0);

  if (totalUsdValue === 0) {
    logger.debug('No locked assets with valid prices found');
    return;
  }

  logger.debug(`Total locked assets USD value: [${totalUsdValue}]`);

  await metricAction.upsertMetric(
    METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD,
    totalUsdValue.toString(),
    Math.floor(Date.now() / 1000),
  );
};
