import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenPriceAction } from '@rosen-bridge/token-price-entity';
import { TokenMap } from '@rosen-bridge/tokens';
import {
  MetricAction,
  METRIC_KEYS,
  LockedAssetsMetricAction,
  EventCountMetricAction,
} from '@rosen-ui/rosen-statistics-entity';

/**
 * Calculate and persist general system metrics.
 *
 * @param dataSource DataSource instance for database operations
 * @param tokenMap   TokenMap instance containing network and token configs
 * @param logger     Optional logger instance
 */
export const generalMetrics = async (
  dataSource: DataSource,
  tokenMap: TokenMap,
  rsnTokenId: string,
  logger?: AbstractLogger,
): Promise<void> => {
  const metricAction = new MetricAction(dataSource, logger);
  const lockedAssetsMetricAction = new LockedAssetsMetricAction(
    dataSource,
    logger,
  );
  const tokenPriceAction = new TokenPriceAction(dataSource, logger);
  const eventCountMetricAction = new EventCountMetricAction(dataSource, logger);

  const timestamp = Math.floor(Date.now() / 1000);

  const networks = tokenMap.getAllChains();
  const networkCount = networks.length;

  await metricAction.upsertMetric(
    METRIC_KEYS.NUMBER_OF_NETWORKS,
    networkCount.toString(),
    timestamp,
  );

  const supportedTokens = tokenMap.getConfig();
  const supportedTokenCount = supportedTokens.length;

  await metricAction.upsertMetric(
    METRIC_KEYS.NUMBER_OF_TOKENS,
    supportedTokenCount.toString(),
    timestamp,
  );

  const rsnPrice = await tokenPriceAction.getLatestTokenPrice(
    rsnTokenId,
    timestamp,
  );

  if (rsnPrice !== undefined) {
    await metricAction.upsertMetric(
      METRIC_KEYS.RSN_PRICE_USD,
      rsnPrice.toString(),
      timestamp,
    );
  }

  await lockedAssetsMetricAction.calculateAndStoreLockedAssetsUsd();

  await eventCountMetricAction.calculateAndStoreEventCounts();
};
