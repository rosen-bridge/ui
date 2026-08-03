import {
  type AbstractLogger,
  DummyLogger,
} from '@rosen-bridge/abstract-logger';
import type { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenPriceAction } from '@rosen-bridge/token-price-entity';
import { ERGO_CHAIN, type TokenMap } from '@rosen-bridge/tokens';
import { METRIC_KEYS, MetricAction } from '@rosen-ui/rosen-statistics-entity';

/**
 * Calculate and persist general system metrics.
 *
 * @param dataSource DataSource instance for database operations
 * @param tokenMap   TokenMap instance
 * @param rsnTokenId RSN token Id
 * @param logger     Optional logger instance
 */
export const generalMetrics = async (
  dataSource: DataSource,
  tokenMap: TokenMap,
  rsnTokenId: string,
  logger: AbstractLogger = new DummyLogger(),
): Promise<void> => {
  logger.debug('Starting general metrics calculation job');

  const metricAction = new MetricAction(
    dataSource,
    logger.child('metricAction'),
  );
  const tokenPriceAction = new TokenPriceAction(
    dataSource,
    logger.child('tokenPriceAction'),
  );

  const timestamp = Math.floor(Date.now() / 1000);

  try {
    const networks = tokenMap.getAllChains();
    const networkCount = networks.length;

    logger.debug(`Number of supported networks: ${networkCount}`);

    await metricAction.upsertMetric(
      METRIC_KEYS.NUMBER_OF_NETWORKS,
      networkCount.toString(),
      timestamp,
    );

    const supportedTokens = tokenMap.getTokens(ERGO_CHAIN, ERGO_CHAIN);
    const supportedTokenCount = supportedTokens.length;

    logger.debug(`Number of supported tokens: ${supportedTokenCount}`);

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
      logger.debug(`RSN price is: ${rsnPrice.toString()}`);

      await metricAction.upsertMetric(
        METRIC_KEYS.RSN_PRICE_USD,
        rsnPrice.toString(),
        timestamp,
      );
    } else {
      logger.warn('RSN price not found, skipping RSN_PRICE_USD metric');
    }

    logger.debug('General metrics calculation job completed successfully');
  } catch (error) {
    logger.error('General metrics calculation job failed', {
      message: error instanceof Error ? error.message : '',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};
